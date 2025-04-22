import clsx from "clsx";
import React, { useState } from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdEdit,
  MdDelete,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../utils";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaList } from "react-icons/fa";
import UserInfo from "./UserInfo";
import { IoMdAdd } from "react-icons/io";
import AddSubTask from "./task/AddSubTask";
import Button from "./Button";
import ConfirmatioDialog from "./Dialogs";
import AddTask from "./task/AddTask";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const PRIORITY_GRADIENTS = {
  high: "from-red-600/90 to-red-700/80",
  medium: "from-yellow-600/90 to-yellow-700/80",
  low: "from-blue-600/90 to-blue-700/80",
};

const TEAM_COLORS = {
  0: "bg-primary",
  1: "bg-green-500",
  2: "bg-purple-500",
  3: "bg-pink-500",
  4: "bg-orange-500",
};

const TaskCard = ({ task }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const deleteClicks = () => {
    setOpenDialog(true);
  };

  const deleteHandler = () => {
    // TODO: Implement delete functionality
    setOpenDialog(false);
  };

  const handleEdit = () => {
    setOpenEdit(true);
  };

  return (
    <>
      <div className={clsx(
        "w-full h-fit p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl",
        "bg-gradient-to-br",
        PRIORITY_GRADIENTS[task?.priority],
        "border border-white/10"
      )}>
        <div className="w-full flex justify-between items-center mb-4">
          <div
            className={clsx(
              "flex flex-1 gap-2 items-center text-sm font-medium text-white",
              PRIOTITYSTYELS[task?.priority]
            )}
          >
            <span className="text-xl">{ICONS[task?.priority]}</span>
            <span className="uppercase tracking-wide">{task?.priority} Priority</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              className="text-white hover:text-white/80 hover:bg-white/10 p-2 rounded-lg transition-colors"
              icon={<MdEdit className="text-lg" />}
            />
            <Button
              onClick={deleteClicks}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-colors"
              icon={<MdDelete className="text-lg" />}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={clsx("w-5 h-5 rounded-full", TASK_TYPE[task.stage])}
            />
            <h4 className="text-lg font-semibold text-white line-clamp-1">{task?.title}</h4>
          </div>
          <span className="text-sm text-white/80 block">
            {formatDate(new Date(task?.date))}
          </span>
        </div>

        <div className="w-full border-t border-white/20 my-4" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex gap-1 items-center text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg">
              <BiMessageAltDetail className="text-blue-300" />
              <span>{task?.activities?.length}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg">
              <MdAttachFile className="text-green-300" />
              <span>{task?.assets?.length}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg">
              <FaList className="text-purple-300" />
              <span>0/{task?.subTasks?.length}</span>
            </div>
          </div>

          <div className="flex flex-row-reverse">
            {task?.team?.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-8 h-8 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  "shadow-md hover:shadow-lg transition-shadow",
                  TEAM_COLORS[index % 5] || TEAM_COLORS[0]
                )}
              >
                <UserInfo user={m} />
              </div>
            ))}
          </div>
        </div>

        {/* sub tasks */}
        {task?.subTasks?.length > 0 ? (
          <div className="py-4 border-t border-white/20">
            <h5 className="text-base font-medium text-white line-clamp-1 mb-2">
              {task?.subTasks[0].title}
            </h5>

            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">
                {formatDate(new Date(task?.subTasks[0]?.date))}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-white font-medium text-sm">
                {task?.subTasks[0].tag}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-4 border-t border-white/20">
            <span className="text-white/70 text-sm">No Sub Task</span>
          </div>
        )}

        <div className="w-full pt-4">
          <button
            onClick={() => setOpen(true)}
            disabled={user.isAdmin ? false : true}
            className={clsx(
              "w-full flex gap-3 items-center text-sm font-medium",
              "px-4 py-2 rounded-lg transition-colors",
              "bg-white/10 hover:bg-white/20",
              "text-white hover:text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <IoMdAdd className="text-lg" />
            <span>ADD SUBTASK</span>
          </button>
        </div>
      </div>

      <AddTask
        open={openEdit}
        setOpen={setOpenEdit}
        task={task}
      />

      <AddSubTask open={open} setOpen={setOpen} id={task._id} />

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        onClick={deleteHandler}
      />
    </>
  );
};

export default TaskCard;
