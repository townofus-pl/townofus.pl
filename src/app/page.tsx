import {Header, RolesList} from "./_components";

export default function Home() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <Header/>
            <RolesList />
        </div>
    );
}
