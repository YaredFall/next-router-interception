import { wait } from "@/utils";
import PageUnload from "../../../components/page_unload";

export default async function Page() {
    await wait(3000);
    return (
        <div>
            <h1>Page 3</h1>
            <div>
                <PageUnload />
            </div>
        </div>
    );
}
