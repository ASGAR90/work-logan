import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../app/providers/AuthProvider";
import { createWorkLog, deleteWorkLog, listAllWorkLogs, updateWorkLog } from "./workLogApi";
import type { WorkLogInput } from "./workLogApi";

const KEY = ["worklogs"];

export function useWorkLogsQuery() {
  const { status } = useAuth();
  return useQuery({
    enabled: status === "authenticated",
    queryKey: KEY,
    queryFn: listAllWorkLogs
  });
}

export function useWorkLogMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  return {
    create: useMutation({ mutationFn: (input: WorkLogInput) => createWorkLog(input), onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: WorkLogInput }) => updateWorkLog(id, input),
      onSuccess: invalidate
    }),
    remove: useMutation({ mutationFn: (id: string) => deleteWorkLog(id), onSuccess: invalidate })
  };
}
