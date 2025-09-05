import { BackendCtx } from "@/backend/lib/ctx"

export const startWorkerProcess = async () => {
  try {
    // biome-ignore lint/correctness/noUnusedVariables: <x>
    const ctx = await BackendCtx.create({
      meta: {
        service: "backend-worker",
        tagPrefix: "backend",
      },
    })
    // const handleWorker = () => {
    //   ctx.logger.info("Worker is running")
    // }
    // handleWorker()
    // setInterval(handleWorker, 10000)
  } catch (e: any) {
    // biome-ignore lint/suspicious/noConsole: <fallback to native logger>
    console.error({
      message: e.message || "Unknown error",
      service: "backend-worker",
      tag: "backend:fatality",
    })
    process.exit(1)
  }
}

if (import.meta.main) {
  void startWorkerProcess()
}
