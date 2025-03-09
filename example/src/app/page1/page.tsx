import { wait } from "@/utils";
import RouterNavigation from "../../../components/router-navigation";

export default async function Page() {
    await wait(1000);
    return (
        <div>
            <h1>Page 2</h1>
            <div>
                <RouterNavigation />
            </div>
        </div>
    );
}
