# One non-secret environment variable for all your secrets

If you work for a responsible company, you probably have to store your secrets in a secure way. Due to this, sometimes, when you need to add or change a secret, you have to go through a lot of steps involving other people, and it can be a pain in the ass.

The **1env** package offers a simple(r) way to approach your secrets, where you have just one (public) variable that, when decrypted, contains all your secrets in a JSON format. Thus, the only secret you have to worry about is the one that decrypts your secrets.

## Installation

```bash
npm install 1env
```

## Usage

1. Create a file called `.secrets.json` in the root of your project, containing all your secrets.

2. ADD IT TO YOUR `.gitignore` FILE.

3. As early as possible in your code (but after env loaders such as `dotenv`), call these two functions:

```javascript
// import { config } from 'dotenv'; // if you use dotenv
import { encryptSecrets, loadSecrets } from '1env';

// config(); // if you use dotenv
encryptSecrets();
loadSecrets();
```

4. Set an environment variable named `ONE_ENV_KEY` with a secure enough value. 

**This is the key that will be used to encrypt and decrypt your secrets, and the only one you will have to worry about.**

For example, if your company requires you to pass all screts through the devops team for encryption, you will only have to do it once and forget about it.

5. After the first run, `encryptSecrets` will fail, and the console will show you the value of a `ONE_ENV_ENCRYPTED` variable you will have to set in your environment. Set it, and run again.

6. If `encryptSecrets` succeeds, `loadSecrets` will load all your secrets into `process.env`.

That’s it! You can now access your secrets via `process.env` just like you would with any other environment variable.

## Notes

1. Whenever you change your `.secrets.json` file, the execution will fail again, indicating which value to set for `ONE_ENV_ENCRYPTED`.

2. The execution will also fail if you don’t add `.secrets.json` to your `.gitignore` file. You’re welcome.