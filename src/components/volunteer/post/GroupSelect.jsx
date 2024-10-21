import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shadcn/select";
import supabase from "@/api/supabase";

const GroupSelect = ({ selectedGroupId, setSelectedGroupId }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("group_list")
          .select("group_id, group_name");

        if (error) throw error;

        setGroups(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div className="mb-4">
      {loading ? (
        <p>Loading groups...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Group:
          </label>
          <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
            <SelectTrigger className="w-full rounded border p-2">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {/* "All" option */}
              <SelectItem key="all" value={null}>
                All
              </SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.group_id} value={group.group_id}>
                  {group.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
};

export default GroupSelect;
