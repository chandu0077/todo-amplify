import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/api";

import { createTodo } from "../../graphql/mutations";
import { listTodos } from "../../graphql/queries";
import awsconfig from "../../aws-exports";
import { Amplify } from "aws-amplify";

Amplify.configure(awsconfig);
const initialState = { name: "", description: "" };
const client = generateClient();
const Todo = () => {
  const colors = [
    "#9271a2",
    "#b97682",
    "#75a271",
    "#71a299",
    "#9ea271",
    "#DFFF00",
    "#CCCCFF",
    "#800080",
    "#000080",
  ];
  const [date, setDate] = useState(new Date());

  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos,
      });
      const todos = todoData.data.listTodos.items;
      const allTodos = todos.map((el) => {
        return {
          ...el,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
      setTodos(allTodos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      const newTodo = {
        ...todo,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setTodos([...todos, newTodo]);
      setFormState(initialState);
      const res = await client.graphql({
        query: createTodo,
        variables: {
          input: todo,
        },
      });
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  return (
    <div className="lg:mx-auto w-full lg:w-[650px] h-full lg:h-[450px] rounded-xl   lg:my-[32px]">
      {/* Header Section */}
      <div className="w-full h-auto bg-[#aebdbe] p-2 lg:rounded-t-xl mb-[12px]">
        <div className="flex justify-around ">
          <p className="text-2xl text-slate-900">{date.toLocaleDateString()}</p>
        </div>
        <div className="flex flex-col items-center gap-y-3 lg:gap-0 lg:flex-row justify-between m-5">
          <input
            onChange={(event) => setInput("name", event.target.value)}
            className="bg-[#ddd] p-[8px] text-[18px] rounded-lg"
            type="text"
            placeholder="Name"
            value={formState.name}
          />
          <input
            onChange={(event) => setInput("description", event.target.value)}
            className="bg-[#ddd] p-[8px] text-[18px] rounded-lg"
            type="text"
            placeholder="description"
            value={formState.description}
          />
          <button
            onClick={addTodo}
            className="bg-black text-white text-[18px] p-[8px] rounded-lg"
          >
            Create Todo
          </button>
        </div>
      </div>
      {/* Tasks Section */}
      <div className="w-full h-[300px] bg-[#ccd4d5] rounded-xl px-[12px] py-[10px] mt-[-20px] overflow-y-auto">
        <p className="text-black text-xl font-bold mb-3 text-center lg:text-start">
          Tasks
        </p>
        {todos.map((todo, idx) => {
          return (
            <div
              key={todo.id ? todo.id : idx}
              className={`w-full h-auto rounded-xl p-5 mb-[12px]`}
              style={{
                backgroundColor: todo.color,
              }}
            >
              <p className="text-[20px] font-bold">{todo.name}</p>
              <p className="text-[20px] font-bold">{todo.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Todo;
