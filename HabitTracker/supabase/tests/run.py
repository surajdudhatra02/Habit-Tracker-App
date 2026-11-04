"""Test migration in a fresh temporary PostgreSQL cluster; never connects remotely."""
from pathlib import Path
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]


def binary(name):
    found = shutil.which(name)
    if not found:
        raise SystemExit(f"Install PostgreSQL and put {name} on PATH to run database tests.")
    return found


def run(command):
    result = subprocess.run(command, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    if result.returncode:
        print(result.stdout)
        raise subprocess.CalledProcessError(result.returncode, command)
    return result.stdout


if __name__ == '__main__':
    initdb, pg_ctl, psql = [binary(name) for name in ('initdb', 'pg_ctl', 'psql')]
    with tempfile.TemporaryDirectory(prefix='habitz-db-') as directory:
        cluster = Path(directory) / 'data'
        log = Path(directory) / 'postgres.log'
        run([initdb, '-D', str(cluster), '-U', 'habit_test_admin', '--auth-local=trust', '--auth-host=reject', '--no-locale', '-E', 'UTF8'])
        started = False
        try:
            # Empty listen_addresses disables TCP entirely. Unique Unix socket
            # directory isolates this from any existing local database server.
            run([pg_ctl, '-D', str(cluster), '-l', str(log), '-o', f"-F -h '' -k '{directory}' -p 65431", '-w', 'start'])
            started = True
            command = [psql, '-X', '-h', directory, '-p', '65431', '-U', 'habit_test_admin', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1']
            run(command + ['-f', str(ROOT / 'tests' / 'fixture.sql')])
            run(command + ['-f', str(ROOT / 'migrations' / '202611030001_atomic_habits_and_ownership.sql')])
            output = run(command + ['-f', str(ROOT / 'tests' / 'transactions.sql')])
            assertions = [line for line in output.splitlines() if 'PASS:' in line]
            run(command + ['-f', str(ROOT / 'migrations' / '202611030001_atomic_habits_and_ownership.sql')])
            count = run(command + ['-Atc', 'select count(*) from public.habits']).strip()
            if count != '1':
                raise AssertionError('Reapplying migration changed existing habit data')
            assertions.append('PASS: migration can be reapplied without changing existing habit data')
            broadcast_migration = ROOT / 'migrations' / '202611040001_broadcast_claims.sql'
            run(command + ['-f', str(broadcast_migration)])
            output = run(command + ['-f', str(ROOT / 'tests' / 'broadcast_claims.sql')])
            assertions.extend(line for line in output.splitlines() if 'PASS:' in line)

            # Eight separate database connections race for one slot. The winner
            # holds its uncommitted insertion briefly, making competitors wait
            # on the unique constraint just as overlapping Edge workers do.
            statement = """
                begin;
                set role service_role;
                insert into public.notification_broadcast_claims(date_ist, time_ist)
                  values ('2026-11-04', '12:00');
                select pg_sleep(0.2);
                commit;
            """
            workers = [subprocess.Popen(
                command + ['-v', 'VERBOSITY=verbose', '-c', statement],
                text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            ) for _ in range(8)]
            results = [(worker.communicate(timeout=10)[0], worker.returncode) for worker in workers]
            if sum(code == 0 for _, code in results) != 1:
                raise AssertionError(f'Expected one broadcast claim winner: {results}')
            if any(code != 0 and '23505' not in output for output, code in results):
                raise AssertionError(f'Unexpected claim error: {results}')
            assertions.append('PASS: eight concurrent database workers produce one claim winner')

            run(command + ['-f', str(broadcast_migration)])
            count = run(command + ['-Atc', 'select count(*) from public.notification_broadcast_claims']).strip()
            if count != '3':
                raise AssertionError('Reapplying broadcast migration changed permanent claims')
            assertions.append('PASS: reapplying broadcast migration preserves permanent claims')
            print('\n'.join(assertions))
            print(f"\n{len(assertions)} PostgreSQL assertions passed (fresh local cluster).")
        finally:
            if started:
                run([pg_ctl, '-D', str(cluster), '-m', 'immediate', '-w', 'stop'])
