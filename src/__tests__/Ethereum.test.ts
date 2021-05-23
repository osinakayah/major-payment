
import { Ethereum } from "../ethereum";
import { saveMnemonic } from "../index";

test('Ethereum', async () => {
    console.log(process.env.DEV_DB_PASSWORD)
    await saveMnemonic()
    const ethereumInstance = new Ethereum();
    await ethereumInstance.generateAddress()
});
