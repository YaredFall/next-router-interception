import { wait } from "@/utils";
import Popstate from "../../../components/popstate";

export default async function Page() {
    await wait(3000);
    return (
        <div>
            <h1>Page 2</h1>
            <div>
                <Popstate />
            </div>
        </div>
    );
}
