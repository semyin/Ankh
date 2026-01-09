export default function Footer() {
	return (
		<footer className="border-t border-gray-200 dark:border-gray-800 mt-auto bg-white dark:bg-gray-950">
			<div className="max-w-5xl mx-auto px-4 py-8 text-center">
				<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
					&copy; {new Date().getFullYear()} DevLog. Designed with{" "}
					<span className="text-red-500">♥</span> by Frontend Expert.
				</p>
				<p className="text-xs text-gray-400">Powered by Single File System</p>
			</div>
		</footer>
	);
}
