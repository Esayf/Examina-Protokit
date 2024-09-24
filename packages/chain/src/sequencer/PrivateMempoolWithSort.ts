import { EventEmitter, log, noop } from "@proto-kit/common";
import { inject } from "tsyringe";

import {
    Mempool,
    MempoolEvents,
    PendingTransaction,
    sequencerModule,
    SequencerModule,
} from "@proto-kit/sequencer";
import type { TransactionStorage } from "@proto-kit/sequencer/dist/storage/repositories/TransactionStorage";
import { TransactionValidator } from "@proto-kit/sequencer/dist/mempool/verification/TransactionValidator";

@sequencerModule()
export class PrivateMempoolWithSort extends SequencerModule implements Mempool {
    public readonly events = new EventEmitter<MempoolEvents>();

    public constructor(
        private readonly transactionValidator: TransactionValidator,
        @inject("TransactionStorage")
        private readonly transactionStorage: TransactionStorage
    ) {
        super();
    }

    public async add(tx: PendingTransaction): Promise<boolean> {
        const [txValid, error] = this.transactionValidator.validateTx(tx);
        if (txValid) {
            const success = await this.transactionStorage.pushUserTransaction(tx);
            if (success) {
                this.events.emit("mempool-transaction-added", tx);
                log.info(
                    `Transaction added to mempool: ${tx.hash().toString()} (${(await this.getTxs()).length} transactions in mempool)`
                );
            } else {
                log.error(
                    `Transaction ${tx.hash().toString()} rejected: already exists in mempool`
                );
            }

            return success;
        }

        log.error(
            `Validation of tx ${tx.hash().toString()} failed:`,
            `${error ?? "unknown error"}`
        );

        throw new Error(
            `Validation of tx ${tx.hash().toString()} failed: ${error ?? "unknown error"}`
        );
    }

    public async getTxs(): Promise<PendingTransaction[]> {
        const pendingTransactions = await this.transactionStorage.getPendingUserTransactions();
        return pendingTransactions.sort((a, b) => Number(a.nonce.sub(b.nonce)));
    }

    public async start(): Promise<void> {
        noop();
    }
}
