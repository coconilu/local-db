import { Loader2Icon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import type { QueryResult } from "@/types";

const defaultSql = "select count(*) as notes_count from notes";

export function QueryConsole() {
  const [sql, setSql] = useState(defaultSql);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function runQuery() {
    setIsRunning(true);
    try {
      const queryResult = await api.readOnlyQuery(sql);
      setResult(queryResult);
      toast.success("Read-only query completed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Query failed.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Read-only Query</CardTitle>
            <CardDescription>Only SELECT and WITH statements are accepted by the API.</CardDescription>
          </div>
          <Badge variant="outline">read-only</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Textarea
          className="min-h-32 font-mono text-sm"
          onChange={(event) => setSql(event.currentTarget.value)}
          spellCheck={false}
          value={sql}
        />
        <div className="flex justify-end">
          <Button disabled={isRunning || sql.trim().length === 0} onClick={() => void runQuery()}>
            {isRunning ? <Loader2Icon className="animate-spin" data-icon="inline-start" /> : <PlayIcon data-icon="inline-start" />}
            Run query
          </Button>
        </div>
        {result ? (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  {result.columns.map((column) => (
                    <TableHead className="font-mono text-xs" key={column}>
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.rows.length === 0 ? (
                  <TableRow>
                    <TableCell className="h-20 text-center text-muted-foreground" colSpan={result.columns.length || 1}>
                      Query returned no rows.
                    </TableCell>
                  </TableRow>
                ) : (
                  result.rows.map((row, index) => (
                    <TableRow key={index}>
                      {result.columns.map((column) => (
                        <TableCell className="font-mono text-xs" key={column}>
                          {String(row[column] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
