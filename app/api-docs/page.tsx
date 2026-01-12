"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl border bg-background p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            API Docs
          </p>
          <h1 className="text-3xl font-semibold">Ozzie Demo API</h1>
        </div>
        <SwaggerUI url="/api-docs/openapi" />
      </div>
    </div>
  );
}
