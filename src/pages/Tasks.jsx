import React, { useState } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useParams } from "react-router-dom";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Button from "../components/Button";
import { IoMdAdd } from "react-icons/io";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import { tasks } from "../assets/data";
import Table from "../components/task/Table";
import AddTask from "../components/task/AddTask";
import TaskCard from "../components/TaskCard";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const TASK_TYPE = {
  todo: "bg-blue-600",
  "in progress": "bg-yellow-600",
  completed: "bg-green-600",
};

const Tasks = () => {
  const params = useParams();
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const status = params?.status || "";

  // Filter tasks based on status
  const filteredTasks = React.useMemo(() => {
    if (!status) return tasks;
    return tasks.filter((task) => task.stage.toLowerCase() === status.toLowerCase());
  }, [status, tasks]);

  // Group tasks by status for board view
  const groupedTasks = React.useMemo(() => {
    return {
      todo: tasks.filter((task) => task.stage === "todo"),
      "in progress": tasks.filter((task) => task.stage === "in progress"),
      completed: tasks.filter((task) => task.stage === "completed"),
    };
  }, [tasks]);

  return loading ? (
    <div className='py-10'>
      <Loading />
    </div>
  ) : (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <Title title={status ? `${status.charAt(0).toUpperCase() + status.slice(1)} Tasks` : "Tasks"} />

        {!status && (
          <Button
            onClick={() => setOpen(true)}
            label='Create Task'
            icon={<IoMdAdd className='text-lg' />}
            className='flex flex-row-reverse gap-1 items-center bg-blue-600 text-white rounded-md py-2 2xl:py-2.5'
          />
        )}
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        {!status && (
          <div className='w-full flex justify-between gap-4 md:gap-x-12 py-4'>
            <TaskTitle label='To Do' className={TASK_TYPE.todo} />
            <TaskTitle
              label='In Progress'
              className={TASK_TYPE["in progress"]}
            />
            <TaskTitle label='Completed' className={TASK_TYPE.completed} />
          </div>
        )}

        {selected !== 1 ? (
          <div className='w-full py-4'>
            {!status ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10'>
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-white mb-2'>To Do</h3>
                  {groupedTasks.todo.map((task, index) => (
                    <TaskCard task={task} key={index} />
                  ))}
                </div>
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-white mb-2'>In Progress</h3>
                  {groupedTasks["in progress"].map((task, index) => (
                    <TaskCard task={task} key={index} />
                  ))}
                </div>
                <div className='space-y-4'>
                  <h3 className='text-lg font-semibold text-white mb-2'>Completed</h3>
                  {groupedTasks.completed.map((task, index) => (
                    <TaskCard task={task} key={index} />
                  ))}
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 2xl:gap-10'>
                {filteredTasks.map((task, index) => (
                  <TaskCard task={task} key={index} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className='w-full'>
            <Table tasks={filteredTasks} />
          </div>
        )}
      </Tabs>

      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
