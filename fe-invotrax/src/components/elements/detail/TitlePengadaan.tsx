
export const Title: React.FC<{
	title: string;
}> = ({ title }) => {
	return (
        <div className="flex flex-row justify-between pr-5">
            <h1 className="text-2xl font-semibold">Request Pengadaan {title}</h1>
        </div>
	);
};
