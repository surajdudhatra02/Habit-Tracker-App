
1 => change habit auth url - as of now habittracker://auth - this everywhare 
1) in supbase dashboard - authentication
URL Configuration
Configure site URL and redirect URLs for authentication
Site URL

2) AndroidManifest.xml
<data android:scheme="mynewapp" />

3) iOS Info.plist
<string>mynewapp</string>

4) const redirectTo = 'mynewapp://auth';



2 => while cont. with google - in browser

That’s why Google shows:

Continue to qyvdhlfgfsipksrlcika.supabase.co

🔴 Why *.supabase.co is STILL shown (even after branding)
The core truth (read carefully):

Your mobile app is NOT the OAuth client.
Supabase is the OAuth client.

So Google sees this flow:

Google → Supabase OAuth server → Your app (via scheme)