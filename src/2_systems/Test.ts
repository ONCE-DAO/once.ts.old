import 'dotenv/config' 
import * as child_process from "child_process";
import * as fs from 'fs';
import * as path from 'path';
import os from 'os'

console.log(os.userInfo().username)
console.log(process.getuid())
// console.log("test");

// fs.mkdirSync("/var/EAMD.ucp")

// child_process.execSync("export HISTIGNORE='*sudo -S*'")
// var command=`sudo <<< "${process.env.rootPW}" mkdir -p /var/foo`;
// child_process.execSync(command)


