const { EventEmitter } = require('events');
const path = require('path');

// Exercise the installed NativeWind bridge against Metro's actual event consumer.
// A Tailwind rebuild used to emit only eventsQueue and crash Metro before HMR.
const { withCssInterop } = require('react-native-css-interop/metro');
const DeltaCalculator =
  require('metro/private/DeltaBundler/DeltaCalculator').default;

test('a virtual CSS rebuild invalidates the correct Metro module without crashing', async () => {
  const projectRoot = require('process').cwd();
  const haste = new EventEmitter();
  const calculator = new DeltaCalculator(new Set(), haste, {
    transformOptions: {},
    unstable_enablePackageExports: true,
  });
  const emitted: any[] = [];
  haste.on('change', (event: any) => emitted.push(event));
  let updateCSS!: (css: string) => void;
  const graph = {
    _haste: haste,
    _fileSystem: { getSha1: () => 'file-sha' },
  };
  const bundler = {
    getDependencyGraph: async () => graph,
    transformFile: jest.fn(),
  };
  const config = withCssInterop(
    {
      projectRoot,
      resolver: { sourceExts: ['js'] },
      transformer: {},
      server: {},
    },
    {
      input: path.join(projectRoot, 'global.css'),
      getCSSForPlatform: async (
        _platform: string,
        onChange: typeof updateCSS,
      ) => {
        updateCSS = onChange;
        return '.test { color: red; }';
      },
    },
  );

  try {
    config.server.enhanceMiddleware(
      (_req: unknown, _res: unknown, next: () => void) => next(),
      { getBundler: () => ({ getBundler: () => bundler }) },
    );
    await config.transformer.getTransformOptions(
      [],
      { dev: true, platform: 'android' },
      async () => [],
    );
    expect(() => updateCSS('.test { color: blue; }')).not.toThrow();
    expect(emitted).toHaveLength(1);
    const event = emitted[0];
    const [[canonicalPath, metadata]] = event.changes.modifiedFiles;
    const virtualPath = path.join(
      projectRoot,
      'node_modules/react-native-css-interop/.cache/android.js',
    );
    expect(event.rootDir).toBe(projectRoot);
    expect(path.join(event.rootDir, canonicalPath)).toBe(virtualPath);
    expect(metadata).toEqual({
      isSymlink: false,
      modifiedTime: expect.any(Number),
    });
    expect(calculator._modifiedFiles.has(virtualPath)).toBe(true);
    expect(event.eventsQueue[0].filePath).toBe(virtualPath);
  } finally {
    calculator.end();
  }
});
