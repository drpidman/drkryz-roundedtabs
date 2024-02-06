import * as vscode from 'vscode';
import * as cp from 'child_process';
import { readFileSync, copyFileSync } from 'fs';
import path from 'path';
import * as os from "os";

export function activate(context: vscode.ExtensionContext) {
    const config = () => vscode.workspace.getConfiguration("roundedtabs");

    let cssFileName = "workbench.desktop.main.css";

    function getVstCss(): string {
        if (process.platform === "win32") {
            let winUser = os.userInfo().username;
            return `C:\\Users\\${winUser}\\AppData\\Local\\Programs\\Microsoft VS Code\\resources\\app\\out\\vs\\${cssFileName}`;
        } else if (process.platform === "linux") {
            return `/opt/visual-studio-code/resources/app/out/vs/workbench/${cssFileName}`;
        }

        return "";
    }

    function getModCss(): string {
        if (process.platform === "win32") {
            let winUser = os.userInfo().username;

            return `\\css\\workbench.desktop.mod.css`;
        } else if (process.platform === "linux") {
            return `/css/workbench.desktop.mod.css`;
        }

        return "";
    }


    function getBckCss(): string {
        if (process.platform === "win32") {
            let winUser = os.userInfo().username;
            return `\\css\\workbench.desktop.backup.css`;
        } else if (process.platform === "linux") {
            return `/css/workbench.desktop.backup.css`;
        }

        return "";
    }


    let restore = vscode.commands.registerCommand('drkryz-roundedtabs.restore', async () => {
        if (process.platform === "linux") {
            const password = await vscode.window.showInputBox({
                prompt: 'Enter your sudo password',
                password: true,
                ignoreFocusOut: true
            });

            if (password) {
                const sudoCommand = `echo ${password} | sudo -S cp ${path.join(__dirname, getBckCss())} ${getVstCss()}`;
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
        } else if (process.platform === "win32") {
            try {
                copyFileSync(getBckCss(), getVstCss());
            } catch(err) {
                console.error(err);
                vscode.window.showInformationMessage("Error to copy mod file to vscode directory. Try execute vscode with administrator");
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

            if (password) {
                const sudoCommand = `echo ${password} | sudo -S cp ${path.join(__dirname, getModCss())} ${getVstCss()}`;
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
        } else if (process.platform === "win32") {
            try {
                copyFileSync(getModCss(), getVstCss());
            } catch(err) {
                console.error(err);
                vscode.window.showInformationMessage("Error to copy mod file to vscode directory. Try execute vscode with administrator");
            }
        } else {
            return;
        }
    });

    context.subscriptions.push(configure_now, restore);
}

export function deactivate() {}
