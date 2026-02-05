import FileUpload from "@/components/file-upload/file-upload";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:to-indigo-400 sm:text-6xl">
            File Upload Hub
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Upload and manage your images and videos with ease. Drag, drop, and watch your content come to life.
          </p>
        </div>

        {/* Upload Section */}
        <div className="mx-auto max-w-4xl">
          <FileUpload />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by Bun + Next.js + Cloudflare R2
          </p>
        </div>
      </div>
    </div>
  );
}
