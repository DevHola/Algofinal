// collection name
const COLLECTION_NAME = "Transall";

// mapping the todo document
export type Transaction = {
    AMOUNT?: string;
    FROM: string;
    TRANSACTION_ADDRESS: any;
};