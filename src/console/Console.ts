import chalk from "chalk";
import { createInterface, Interface } from 'readline';
import { HelpCommand } from "./commands/HelpCommand";
import { InfoPayerCommand } from "./commands/InfoPayerCommand";
import { InfoReceiverCommand } from "./commands/InfoReceiverCommand";
import { ListPayersCommand } from "./commands/ListPayersCommand";
import { ListReceiverCommand } from "./commands/ListReceiversCommand";
import { printHelloTag } from "./payfluxoLogo";

export class PayfluxoConsole {
    private commandsInterface: Interface;
    private static instance: PayfluxoConsole;

    private static debugMode: boolean;

    public constructor() {
        this.commandsInterface = createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        })
        PayfluxoConsole.debugMode = false;
    }

    public static getInstance = (): PayfluxoConsole => {
        if (!PayfluxoConsole.instance) {
            PayfluxoConsole.instance = new PayfluxoConsole();
        }
        return PayfluxoConsole.instance;
    }

    private commandReaction = async (value: string) => {
        const commandWords = value.split(' ');
        try{
            switch (commandWords[0]){
                case 'list':
                    switch (commandWords[1]){
                        case 'payers':
                            await ListPayersCommand.activate();
                            break;
                        case 'receivers':
                            await ListReceiverCommand.activate();
                            break;
                        default:
                            this.error('Wrong command! try "help"');
                            break;
                    }
                    break;
                case 'info':
                    const index = Number.parseInt(commandWords[2]);
                    switch (commandWords[1]){
                        case 'payers':
                            await InfoPayerCommand.activate(index)
                            break;
                        case 'receivers':
                            await InfoReceiverCommand.activate(index);
                            break;
                        default:
                            this.error('Wrong command! try "help"');
                            break;
                    }
                    break;
                case 'help':
                    await HelpCommand.activate();
                    break;
                case 'debug':
                    PayfluxoConsole.debugMode = !PayfluxoConsole.debugMode;
                    break;
                case '':
                    break;
                default:
                    this.error('Unknown command! try "help"');
                    break;
            }
        }
        catch (e: any) {
            this.error(e.message);
        }
    }

    public log = (message: string) => {
        console.log(chalk.white(`[*] ${message}`));
    }

    public error = (message: string) => {
        console.log(chalk.red(`[x] ${message}`));
    }

    public warn = (message: string) => {
        console.log(chalk.yellow(`[!] ${message}`));
    }

    public sucess = (message: string) => {
        console.log(chalk.green(`[+] ${message}`));
    }

    public debug = (message: string) => {
        if(PayfluxoConsole.debugMode)
            console.log(chalk.blue(`[?] ${message}`));
    }

    public table = (structData: Object[]) => {
        console.table(structData);
    }

    public ask = async (prompt: string): Promise<string> => {
        return new Promise<string>(resolve => {
            this.commandsInterface.question(`> ${prompt}`, input => resolve(input))
        })
    }

    public enableCommands = async () => {
        while (true){
            const command = await this.ask("");
            await this.commandReaction(command);
        }
    }

    public startConsole = async () => {
        printHelloTag();
    }
}
