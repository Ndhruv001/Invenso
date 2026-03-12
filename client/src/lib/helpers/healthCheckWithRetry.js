import healthCheckEndPoint from "@/services/adminServices"

export async function healthCheckWithRetry(retries = 3) {
  try {
    const res = await healthCheckEndPoint();
    console.log("🚀 ~ healthCheckWithRetry ~ res:", res)

    if (!res.ok) throw new Error("Request failed");

    return res;
  } catch (error) {
    console.log("🚀 ~ healthCheckWithRetry ~ r:", r)
    if (retries === 0) throw error;

    await new Promise(resolve => setTimeout(resolve, 6000));

    return healthCheckWithRetry(retries - 1);
  }
}

export default healthCheckWithRetry;