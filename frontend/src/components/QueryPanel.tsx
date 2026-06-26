import { Button, Code, Group, Table, Text, Textarea } from "@mantine/core";
import { Play } from "lucide-react";
import { useState } from "react";

import { api } from "../lib/api";
import type { QueryResult } from "../types";

const DEFAULT_SQL = "select count(*) as notes_count from notes";

export function QueryPanel() {
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  async function runQuery() {
    setIsRunning(true);
    try {
      setError("");
      const nextResult = await api.readOnlyQuery(sql);
      setResult(nextResult);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="query-panel">
      <Group justify="space-between" align="center">
        <div>
          <Text className="section-title">Read-only Query</Text>
          <Text className="muted">SELECT and WITH statements only.</Text>
        </div>
        <Button className="primary-button" leftSection={<Play size={16} />} loading={isRunning} onClick={runQuery}>
          Run
        </Button>
      </Group>
      <Textarea
        value={sql}
        onChange={(event) => setSql(event.currentTarget.value)}
        autosize
        minRows={4}
        classNames={{ input: "sql-input" }}
      />
      {error && <div className="error-line">{error}</div>}
      {result && (
        <div className="result-panel" data-testid="query-result">
          <Table.ScrollContainer minWidth={620}>
            <Table className="data-table">
              <Table.Thead>
                <Table.Tr>
                  {result.columns.map((column) => (
                    <Table.Th key={column}>{column}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {result.rows.map((row, index) => (
                  <Table.Tr key={index}>
                    {result.columns.map((column) => (
                      <Table.Td key={column}>
                        <Code className="cell-code">{String(row[column] ?? "")}</Code>
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </div>
      )}
    </div>
  );
}
