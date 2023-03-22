import crypto from 'crypto';
import fs from 'fs';
import { $if, isDefined, itself } from "vovas-utils";
import { encrypt } from './encryption';

export function encryptSecrets(filename: string = '.secrets.json') {
  // 1. Reads the `[root]/.secrets.json` file for the secrets (making sure it is git-ignored)
  // 2. Reads the (secret) process.env.ONE_ENV_SECRET variable for the encryption key
  // 3. Encrypts the JSON string
  // 4. Compares the encrypted string to the (non-secret) process.env.ONE_ENV_ENCRYPTED variable
  // 5. If they are different, throws an error (so that the user can update the variable)
  // Note: If no .secrets.json file exists, gives a warning message but does not throw an error

  const secretsFilename = `${process.cwd()}/${filename}`;
  if ( !fs.existsSync(secretsFilename) ) {
    console.log(`\x1b[33mWarning: no ${secretsFilename} file found, skipping encryption\x1b[0m`);
    return;
  }

  const gitIgnoreFilename = `${process.cwd()}/.gitignore`;
  if ( !fs.existsSync(gitIgnoreFilename) ) {
    throw new Error(`${secretsFilename} has to be git-ignored, but no ${gitIgnoreFilename} file found`);
  }
  const gitIgnores = fs.readFileSync(gitIgnoreFilename, 'utf8').split('\n');
  if ( !gitIgnores.includes(filename) ) {
    throw new Error(`${secretsFilename} has to be git-ignored, but it is not in ${gitIgnoreFilename}`);
  }

  const secrets = JSON.parse(fs.readFileSync(secretsFilename, 'utf8'));

  const key = 
    $if( process.env.ONE_ENV_SECRET, isDefined, itself )
    .else( () => {
      // Create a new key, show it to the user, and throw an error
      const key = crypto.randomBytes(32).toString('hex');
      console.log(`\x1b[33mONE_ENV_SECRET=${key}\x1b[0m`);
      console.log(`\x1b[31mSet the ONE_ENV_SECRET environment variable to the above value, then run the command again. IMPORTANT: THIS VALUE IS SECRET AND SHOULD NOT BE SHARED\x1b[0m`);
      throw new Error(`ONE_ENV_SECRET environment variable is not set`);
    } )

  const encrypted = encrypt(JSON.stringify(secrets), key);

  if ( process.env.ONE_ENV_ENCRYPTED !== encrypted ) {
//     throw new Error(`1env public environment variables are not set or outdated, please update as follows:

// \x1b[33mONE_ENV_ENCRYPTED=${encrypted}\x1b[0m`);
    console.log(`\x1b[33mONE_ENV_ENCRYPTED=${encrypted}\x1b[0m`);
    console.log(`\x1b[31mSet the ONE_ENV_ENCRYPTED environment variable to the above value, then run the command again. Note: this value is public and can be shared\x1b[0m`);
    throw new Error(`ONE_ENV_ENCRYPTED environment variable is not set`);
  }

  return encrypted;

};
