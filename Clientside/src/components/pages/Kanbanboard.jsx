import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/kanban.css";

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({ todo: [], inprogress: [], done: [] });
  const [newTask, setNewTask] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/todo", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const grouped = { todo: [], inprogress: [], done: [] };
      res.data.forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        } else {
          grouped.todo.push(task); // fallback
        }
      });
      setTasks(grouped);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "") return;

    try {
      const res = await axios.post(
        "http://localhost:3000/api/todo",
        { title: newTask, status: "todo" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) => ({ ...prev, todo: [...prev.todo, res.data] }));
      setNewTask("");

      // ✅ Analytics: track task creation
      try {
        await axios.post(
          "http://localhost:3000/api/analytics",
          { type: "todo_create", todoId: res.data._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Analytics tracking failed:", err);
      }
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const moveTask = async (task, from, to) => {
    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/todo/${task._id}`,
        { status: to },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) => {
        const updatedFrom = prev[from].filter((t) => t._id !== task._id);
        const updatedTo = [...prev[to], data];
        return { ...prev, [from]: updatedFrom, [to]: updatedTo };
      });

      // (Optional) You can add analytics tracking for moves if needed
    } catch (err) {
      console.error("Error moving task", err);
    }
  };

  const editTask = async (task, from) => {
    const newTitle = prompt("Edit task:", task.title);
    if (!newTitle || newTitle.trim() === "") return;

    try {
      const { data } = await axios.put(
        `http://localhost:3000/api/todo/${task._id}`,
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) => ({
        ...prev,
        [from]: prev[from].map((t) =>
          t._id === task._id ? { ...t, title: data.title } : t
        ),
      }));

      // ✅ Analytics: track task edit
      await axios.post(
        "http://localhost:3000/api/analytics",
        { type: "todo_edit", todoId: data._id, newTitle: data.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error editing task", err);
    }
  };

  const deleteTask = async (task, from) => {
    try {
      await axios.delete(`http://localhost:3000/api/todo/${task._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks((prev) => ({
        ...prev,
        [from]: prev[from].filter((t) => t._id !== task._id),
      }));

      // ✅ Analytics: track delete
      try {
        const completedCount = from === "done" ? tasks.done.length - 1 : tasks.done.length;
        const pendingCount =
          tasks.todo.length + tasks.inprogress.length - (from === "done" ? 0 : 1);

        await axios.post(
          "http://localhost:3000/api/analytics",
          {
            todoCompleted: completedCount,
            todoPending: pendingCount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (analyticsError) {
        console.error("Analytics tracking failed:", analyticsError);
      }
    } catch (err) {
      console.error("Error deleting task", err);
    }
  };

  const renderColumn = (title, key) => (
    <div className="kanban-column">
      <h2>{title}</h2>
      <div>
        {tasks[key].map((task) => (
          <div key={task._id} className="kanban-task">
            <div className="task-info">
              <span className="task-text">{task.title}</span>
              <small className="task-date">
                Created: {new Date(task.createdAt).toLocaleString()}
              </small>
            </div>
            <div className="task-buttons">
              {key !== "todo" && (
                <button
                  onClick={() =>
                    moveTask(task, key, key === "inprogress" ? "todo" : "inprogress")
                  }
                >
                  ←
                </button>
              )}
              {key !== "done" && (
                <button
                  onClick={() =>
                    moveTask(task, key, key === "todo" ? "inprogress" : "done")
                  }
                >
                  ✔️
                </button>
              )}
              <button onClick={() => editTask(task, key)}>✏️</button>
              <button onClick={() => deleteTask(task, key)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="kanban-container">
      <h1>Kanban Board</h1>

      <div className="add-task">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Task"
        />
        <button onClick={addTask}>Add</button>
      </div>

      <div className="kanban-board">
        {renderColumn("To Do", "todo")}
        {renderColumn("In progress", "inprogress")}
        {renderColumn("Done", "done")}
      </div>
    </div>
  );
};

export default KanbanBoard;
