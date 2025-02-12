import Image from "next/image";

export default function Custom404() {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="inline-block text-center mt-20 mx-auto">
                <Image src="/images/404.png" alt="Detective" width={200} height={200}
                       className="inline-block scale-125 drop-shadow-2xl"/>
                <h3 className="font-brook text-6xl drop-shadow-md">Nic tu nie ma</h3>
                <p className="mt-8 text-2xl drop-shadow-md">Strona, której szukasz, nie istnieje.</p>
            </div>
        </div>
    )
}
