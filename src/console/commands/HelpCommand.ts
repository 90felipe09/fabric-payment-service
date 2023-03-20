import { PayfluxoConsole } from "../Console";

export class HelpCommand {

    private static mountHelpData = (): any[] => {
        const data = [
            { command: 'list payers', description: 'List current peers payers' },
            { command: 'list receivers', description: 'List current peers receiving payments' },
            { command: 'info payers <number>', description: 'Details about a specific payer' },
            { command: 'info receivers <number>', description: 'Details about a specific receiver' },
            { command: 'debug', description: 'Toggles debug logs'}
        ];
        return data;
    }

    public static activate = async () => {
        const tConsole = PayfluxoConsole.getInstance();
        const tableData = HelpCommand.mountHelpData();
        tConsole.table(tableData);
    }
}
