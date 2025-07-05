const request = {
  async fetch(
    request: Request,
    env: { SITE_ID: string; PAYMENT_PROCESSOR_URL: string },
    ctx: ExecutionContext
  ): Promise<Response> {
    const paymentProcessorUrl =
      env.PAYMENT_PROCESSOR_URL || "https://dashpay.footisking.com/";
    const originalUrl = new URL(request.url);
    const siteId = env.SITE_ID;

    let url = new URL(paymentProcessorUrl);
    const hasPath =
      Boolean(originalUrl.pathname) &&
      /^(?!\/(_next|_static|api)(\/|$))(?!.*\.[^.]+$).*/.test(
        originalUrl.pathname
      );
    if (!hasPath) {
      return fetch(`${paymentProcessorUrl}${originalUrl.pathname}`);
    }
    const paymentPath = request.url.replace(/^.*\/payment\/(.*)/, "$1");
    const newUrl = `${paymentProcessorUrl}s/${siteId}/payment/${paymentPath}`;
    const newRequest = new Request(newUrl, {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.body,
    });

    if (hasPath) {
      newRequest.headers.set("x-middleware-rewrite", url.toString());
      newRequest.headers.set("x-middleware-next", "1");
    }

    console.log("DATA", {
      paymentProcessorUrl,
      reqUrl: request.url,
      newUrl,
      paymentPath,
      p: originalUrl.pathname,
    });
    const response = await fetch(newRequest);
    if (response.ok && response.url !== newRequest.url) {
      return Response.redirect(response.url, 307);
    }
    return response;
  },
};

export default request;
