import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://mi-backend-api.onrender.com"; // ← cambia esto por tu URL real

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [participants, setParticipants] = useState("");
  const [log, setLog] = useState("");
  const [columns, setColumns] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const columnOrder = ["espera", "pendiente", "resuelta"];

  const fetchTasks = () => {
    axios
      .get(`${API_URL}/tasks`)
      .then((res) => {
        setColumns({
          espera: {
            name: "En espera de resolución",
            items: res.data.filter((task) => !task.completed),
          },
          pendiente: {
            name: "Pendiente de confirmación de 3ero",
            items: [],
          },
          resuelta: {
            name: "Resuelta",
            items: res.data.filter((task) => task.completed),
          },
        });
      })
      .catch((err) => console.error("Error al cargar tareas:", err));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = () => {
    if (title.trim() === "") return;

    const newTask = {
      title,
      description,
      participants,
      log,
      completed: false,
    };

    axios
      .post(`${API_URL}/tasks`, newTask)
      .then(() => {
        fetchTasks();
        setTitle("");
        setDescription("");
        setParticipants("");
        setLog("");
        setShowForm(false);
      })
      .catch((err) => console.error("Error al añadir tarea:", err));
  };

  const moveTask = (task, fromColumn, direction) => {
    const fromIndex = columnOrder.indexOf(fromColumn);
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= columnOrder.length) return;

    axios
      .put(`${API_URL}/tasks/${task._id}`, { ...task })
      .then(() => {
        fetchTasks();
      });
  };

  const deleteTask = (taskId) => {
    axios
      .delete(`${API_URL}/tasks/${taskId}`)
      .then(() => {
        fetchTasks();
      })
      .catch((err) => console.error("Error al eliminar tarea:", err));
  };

  const toggleCompleted = (taskId, currentStatus) => {
    axios
      .put(`${API_URL}/tasks/${taskId}`, { completed: !currentStatus })
      .then(() => {
        fetchTasks();
      })
      .catch((err) => console.error("Error al actualizar tarea:", err));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tablero de tareas</h1>

      <button
        onClick={() => setShowForm(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Añadir tarea
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖️
            </button>
            <h2 className="text-xl font-bold mb-4">Nueva tarea</h2>
            <div className="grid gap-3">
              <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="border p-2 rounded" />
              <input type="text" placeholder="Personas implicadas" value={participants} onChange={(e) => setParticipants(e.target.value)} className="border p-2 rounded" />
              <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded" />
              <textarea placeholder="Log de comentarios" value={log} onChange={(e) => setLog(e.target.value)} className="border p-2 rounded" />
              <button onClick={addTask} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Añadir tarea</button>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button onClick={() => setSelectedTask(null)} className="absolute top-2 right-2 text-gray-600 hover:text-black">✖️</button>
            <h2 className="text-xl font-bold mb-4">Editar tarea</h2>
            <div className="grid gap-3">
              <input type="text" value={selectedTask.title} onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })} className="border p-2 rounded" />
              <input type="text" value={selectedTask.participants} onChange={(e) => setSelectedTask({ ...selectedTask, participants: e.target.value })} className="border p-2 rounded" />
              <textarea value={selectedTask.description} onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })} className="border p-2 rounded" />
              <textarea value={selectedTask.log} onChange={(e) => setSelectedTask({ ...selectedTask, log: e.target.value })} className="border p-2 rounded" />
              <button onClick={() => {
                axios.put(`${API_URL}/tasks/${selectedTask._id}`, selectedTask).then(() => {
                  setSelectedTask(null);
                  fetchTasks();
                });
              }} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar cambios</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns && columnOrder.map((columnId) => (
          <div key={columnId} className="bg-gray-100 p-3 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">{columns[columnId].name}</h2>
            <div className="space-y-2 min-h-[100px] bg-white p-2 rounded">
              {columns[columnId].items.map((item) => (
                <div key={item._id} className="bg-white p-3 rounded shadow flex justify-between items-center cursor-pointer" onClick={() => setSelectedTask(item)}>
                  <span className={`flex-grow mr-2 ${item.completed ? "line-through text-gray-400" : ""}`}>{item.title}</span>
                  <div className="flex gap-1 items-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleCompleted(item._id, item.completed)} className={`text-lg px-2 py-1 rounded font-bold ${item.completed ? "text-green-600 border border-green-600" : "text-gray-500 border border-gray-300"} hover:bg-gray-100`}>✔️</button>
                    <button onClick={() => moveTask(item, columnId, "left")} disabled={columnOrder.indexOf(columnId) === 0} className="bg-gray-200 text-xl px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-30">←</button>
                    <button onClick={() => moveTask(item, columnId, "right")} disabled={columnOrder.indexOf(columnId) === columnOrder.length - 1} className="bg-gray-200 text-xl px-3 py-1 rounded hover:bg-gray-300 disabled:opacity-30">→</button>
                    <button onClick={() => deleteTask(item._id)} className="bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
