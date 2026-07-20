import { Dispatch, SetStateAction } from "react";

export interface ShareUserProp {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  branch_code: {
    id: number;
    branch_code: string;
    branch_name: string;
  };
}

export default function ShareUserLists({
  user,
  setSelectedUsers,
  selectedUsers,
}: {
  user: ShareUserProp;
  setSelectedUsers: Dispatch<SetStateAction<string[]>>;
  selectedUsers: string[];
}) {
  return (
    <li
      className={`list-row cursor-pointer hover:border ${selectedUsers.includes(String(user.id)) && "border-[1px] border-green-300"}`}
      onClick={() => {
        setSelectedUsers((prev) =>
          prev.includes(String(user.id))
            ? prev.filter((id) => id !== String(user.id))
            : [...prev, String(user.id)],
        );
      }}
    >
      <div className="list-col-grow">
        <div>{`${user.lastName}, ${user.firstName}`}</div>
        <div>{user.branch_code.branch_name}</div>
        <div className="text-xs uppercase font-semibold opacity-60">
          {user.position}
        </div>
      </div>
      <input
        type="checkbox"
        className="checkbox"
        value={String(user.id)}
        checked={selectedUsers.includes(String(user.id))}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedUsers((prev) =>
              prev.includes(String(user.id))
                ? prev
                : [...prev, String(user.id)],
            );
          } else {
            setSelectedUsers((prev) =>
              prev.filter((id) => id !== String(user.id)),
            );
          }
        }}
      />
    </li>
  );
}
