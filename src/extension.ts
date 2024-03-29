import * as vscode from 'vscode';
import * as cp from 'child_process';
import { readFileSync, copyFileSync, existsSync } from 'fs';
import path from 'path';
import * as os from "os";
import { create } from 'domain';

enum Action {
    Copy,
    Move
}

export function activate(context: vscode.ExtensionContext) {
    const config = () => vscode.workspace.getConfiguration("roundedtabs");

    let cssFileName = "workbench.desktop.main.css";

    function createInputPlaceFolder(): Thenable<string | undefined> {
        return new Promise((resolve, reject) => {
            vscode.window.showInputBox({
                title: "VSCode Installation Path",
                prompt: "Place your path of installation vscode here",
                ignoreFocusOut: true
            }).then((file) => {
                if (typeof file === "undefined") {
                    return reject("Please, provide a installation path");
                }

                return resolve(file);
            });
        });
    }

    async function getVstCss(): Promise<string> {
        let username = os.userInfo().username;

        if (process.platform === "win32") {
            let winPath = `C:\\Users\\${username}\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\out\\vs\\workbench\\${cssFileName}`;
            if (existsSync(winPath)) {
                return winPath;
            }
            
            const res_file = await createInputPlaceFolder();
            if (res_file && existsSync(res_file)) {
                return `${path.join(res_file, '/resources', '/app', '/out', '/vs', '/workbench', `${cssFileName}`)}`;
            }
        } 
        
        if (process.platform === "linux") {
            let linuxPath = `/opt/visual-studio-code/resources/app/out/vs/workbench/${cssFileName}`;

            if (existsSync(linuxPath)) {
                return linuxPath;
            } 

            const res_file = await createInputPlaceFolder();
            if (res_file && existsSync(res_file)) {
                return `${res_file}/resources/app/out/vs/workbench/${cssFileName}`;
            } else {
                vscode.window.showInformationMessage("Please, provide a valid installation path of vscode");
            }
        }

        if (process.platform === "darwin") {
            let macPath = `/Users/${username}/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/${cssFileName}`;

            if (existsSync(macPath)) {
                return macPath;
            }

            const res_file = await createInputPlaceFolder();
            if (res_file && existsSync(res_file)) {
                return `${res_file}/Contents/Resouces/app/out/vs/workbench/${cssFileName}`;
            } else {
                vscode.window.showInformationMessage("Please, provide a valid installation path of vscode");
            }
        }

        return "";
    }

    function getModCss(): string {
        if (process.platform === "win32") {
            return `${path.join(__dirname, '/css', 'workbench.desktop.mod.css')}`;
        } 
        
        if (process.platform === "linux") {
            return `/css/workbench.desktop.mod.css`;
        }

        if (process.platform === "darwin") {
            return `${path.join(__dirname, "/css", "workbench.desktop.mod.css")}`;
        }

        return "";
    }

    function getBckCss(): string {
        if (process.platform === "win32") {
            return `${path.join(__dirname, '/css', 'workbench.desktop.backup.css')}`;
        }
        
        if (process.platform === "linux") {
            return `/css/workbench.desktop.backup.css`;
        }

        if (process.platform === "darwin") {
            return `${path.join(__dirname, "/css", "workbench.backup.mod.css")}`;
        }


        return "";
    }

    function actionMod(password: string, srcDir: string, destDir: string) {
        if (process.platform !== "linux" && process.platform !== "darwin") return;
        
        if (password) {
            const sudoCommand = `echo ${password} | sudo -S cp ${srcDir} ${destDir}`;
            cp.exec(sudoCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing sudo command: ${error}`);
                    vscode.window.showErrorMessage(`Error executing sudo command: ${error}`);
                    return;
                } 

                vscode.window.showInformationMessage("Success applying styles, restart now", "Restart").then((value) => {
                    if (value === "Restart") {
                        vscode.commands.executeCommand("workbench.action.reloadWindow");
                    }
                });
            });
        }
    
    }

    let restore = vscode.commands.registerCommand('drkryz-roundedtabs.restore', async () => {
        if (process.platform === "linux") {
            const password = await vscode.window.showInputBox({
                prompt: 'Enter your sudo password',
                password: true,
                ignoreFocusOut: true
            });

            if (password) {
                const sudoCommand = `echo ${password} | sudo -S cp ${path.join(__dirname, getBckCss())} ${await getVstCss()}`;
                cp.exec(sudoCommand, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing sudo command: ${error}`);
                        vscode.window.showErrorMessage(`Error executing sudo command: ${error}`);
                        return;
                    } 

                    vscode.window.showInformationMessage("Success applying styles, restart now", "Restart").then((value) => {
                        if (value === "Restart") {
                            vscode.commands.executeCommand("workbench.action.reloadWindow");
                        }
                    });
                });
            }
        }
        
        if (process.platform === "win32") {
            try {
                copyFileSync(getBckCss(), await getVstCss());
                vscode.window.showInformationMessage("Success applying styles, restart now", "Restart").then((value) => {
                    if (value === "Restart") {
                        vscode.commands.executeCommand("workbench.action.reloadWindow");
                    }
                });
            } catch(err) {
                console.error(err);
                vscode.window.showInformationMessage(`Error to copy backup file to vscode directory. Try execute vscode with administrator. More info: ${err}`);
            }
        } else {
            return;
        }
    });


    let configure_now = vscode.commands.registerCommand('drkryz-roundedtabs.configure_now', async () => {
        if (process.platform === "linux") {
            const password = await vscode.window.showInputBox({
                prompt: 'Enter your sudo password',
                password: true,
                ignoreFocusOut: true,
            });

            if (!password) {
                vscode.window.showInformationMessage("Please, provide a password");
                return;
            }

            actionMod(password, path.join(__dirname, getModCss()), await getVstCss());
        }
        
        if (process.platform === "win32") {
            try {
                copyFileSync(getModCss(), await getVstCss());
                vscode.window.showInformationMessage("Success applying styles, restart now", "Restart").then((value) => {
                    if (value === "Restart") {
                        vscode.commands.executeCommand("workbench.action.reloadWindow");
                    }
                });
            } catch(err) {
                console.error(err);
                vscode.window.showInformationMessage(`Error to copy mod file to vscode directory. Try execute vscode with administrator. More info: ${err}`);
            }
        }

        if (process.platform === "darwin") {
            const password = await vscode.window.showInputBox({
                prompt: 'Enter your sudo password',
                password: true,
                ignoreFocusOut: true,
            });

            if (!password) {
                vscode.window.showInformationMessage("Please, provide a password");
                return;
            }

            actionMod(password, path.join(__dirname, getModCss()), await getVstCss());
        }
    });

    context.subscriptions.push(configure_now, restore);
}

export function deactivate() {}
