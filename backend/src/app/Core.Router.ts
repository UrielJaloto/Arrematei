interface IRoutable {
  (pRequest: Request, pParams?: Record<string, string>): Promise<Response> | Response;
}

interface IRoute {
  Method: string;
  PathPattern: RegExp;
  ParamNames: string[];
  Handler: IRoutable;
}

class RouterCore {
  private cRoutes: IRoute[] = [];

  public addRoute(pMethod: string, pPath: string, pHandler: IRoutable): void {
    const vParamNames: string[] = [];
    const vParsedPath = pPath.replace(/:(\w+)/g, (_, pParamName) => {
      vParamNames.push(pParamName);
      return "([^/]+)";
    });

    const vPathPattern = new RegExp(`^${vParsedPath}$`);
    this.cRoutes.push({
      Method: pMethod.toUpperCase(),
      PathPattern: vPathPattern,
      ParamNames: vParamNames,
      Handler: pHandler,
    });
  }

  public async route(pRequest: Request): Promise<Response> {
    const vUrl = new URL(pRequest.url);
    const vPathname = vUrl.pathname;
    const vMethod = pRequest.method.toUpperCase();

    for (const vRoute of this.cRoutes) {
      if (vRoute.Method !== vMethod) {
        continue;
      }

      const vMatch = vRoute.PathPattern.exec(vPathname);
      if (!vMatch) {
        continue;
      }
      
      const vParams: Record<string, string> = {};
      vRoute.ParamNames.forEach((pParamName, pIndex) => {
        vParams[pParamName] = decodeURIComponent(vMatch[pIndex + 1]);
      });

      try {
        return await vRoute.Handler(pRequest, vParams);
      } catch (pError) {
        console.error(`Error handling ${vMethod} ${vPathname}:`, pError);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ message: "Endpoint not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const cRouterInstance = new RouterCore();