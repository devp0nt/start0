export const startWorkerProcess = () => {
  const handleWorker = () => {
    console.log("Worker is running")
  }
  handleWorker()
  setInterval(handleWorker, 10000)
}

if (import.meta.main) {
  startWorkerProcess()
}
