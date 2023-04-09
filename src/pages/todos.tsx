// Imports
// ========================================================
import { type NextPage } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";

// Page Component
// ========================================================
const Todos: NextPage = () => {
  // State / Props / Hooks
  const { data: sessionData } = useSession();
  const [todos, setTodos] = useState<{ task: string; id: string; completed: boolean; }[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Requests
  // - All
  const {
    data: todosAllData,
    isLoading: todosAllIsLoading,
    refetch: todosAllRefetch
  } = api.todos.all.useQuery(
    undefined, // no input
    {
      // Disable request if no session data
      enabled: sessionData?.user !== undefined,
      onSuccess: () => {
        setNewTodo(''); // reset input form
      }
    },
  );
  // - Add
  const {
    mutate: todosAddMutate,
    isLoading: todosAddIsLoading,
  } = api.todos.add.useMutation({
    onSuccess: async () => {
      await todosAllRefetch();
    }
  });
  // - Remove
  const {
    mutate: todosRemoveMutate,
    isLoading: todosRemoveIsLoading,
  } = api.todos.remove.useMutation({
    onSuccess: async () => {
      await todosAllRefetch();
    }
  });
  // - Update
  const {
    mutate: todosUpdateMutate,
    isLoading: todosUpdateIsLoading,
  } = api.todos.update.useMutation({
    onSuccess: async () => {
      await todosAllRefetch();
    }
  });
  // Handle loading for all requests to disable buttons and inputs
  const isRequestLoading = todosAllIsLoading || todosAddIsLoading || todosRemoveIsLoading || todosUpdateIsLoading;

  // Functions
  /**
   * 
   * @param event 
   */
  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    console.group('onSubmitForm');
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const todoValue = formData.get('todo') as string || '';
    console.log({ todoValue });

    todosAddMutate({ task: todoValue });
    console.groupEnd();
  };

  /**
   * 
   * @param id 
   * @returns 
   */
  const onClickToggleDone = (id: string) => () => {
    console.group('onClickToggleDone');
    console.log({ id });

    todosUpdateMutate({
      id,
      completed: !todos.find(i => i.id === id)?.completed
    })
    console.groupEnd();
  };

  /**
   * 
   * @param id 
   * @returns 
   */
  const onClickDelete = (id: string) => () => {
    console.group('onClickDelete');
    console.log({ id });

    todosRemoveMutate({
      id
    });
    console.groupEnd();
  };

  // Hooks
  useEffect(() => {
    console.log({ todosAllData });
    if (todosAllIsLoading) return;
    setTodos(todosAllData || []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todosAllData]);

  // When rendering client side don't display anything until loading is complete
  // if (typeof window !== "undefined" && loading) return null
  // If no session exists, display access denied message
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            {!sessionData ? 'Access Denied' : 'Todos'}
          </h1>
        </div>
        <div className="block mb-4 h-10">
          <Link className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20" href="/">Home Page</Link>
        </div>
        {sessionData ? <div className="w-full flex justify-center items-center flex-col">
          <form onSubmit={onSubmitForm} className="w-full max-w-md block mb-4">
            <div className="mb-4">
              <label className="block text-white/50 mb-2">New Todo</label>
              <input disabled={isRequestLoading} onChange={(e) => setNewTodo(e.target.value)} className="disabled:opacity-30 h-10 bg-white rounded px-4 w-full" type="text" name="todo" value={newTodo} />
            </div>
            <div className="mb-4">
              <button disabled={isRequestLoading} type="submit" className="disabled:opacity-30 disabled:hover:bg-white/10 mr-4 w-full rounded-full bg-white/10 px-6 font-semibold text-white no-underline transition hover:bg-white/20 h-10">Add</button>
            </div>
          </form>
          {todos.length === 0
            ? <p className="text-white">(No todos yet!)</p>
            : <ul className="w-full max-w-md block">
              {todos.map((todo, key) => <li key={`todo-${key}-${todo.id}`} className={`flex justify-between items-center ${key % 2 === 0 ? 'bg-white/5 hover:bg-white/10' : 'bg-white/10 hover:bg-white/20'} transition-colors ease-in-out duration-200 rounded-tl rounded-tr p-4 border-b border-b-white/50`}>
                <span className={`text-white font-semibold ${todo.completed ? 'line-through' : ''}`}>{todo.task}</span>
                <span>
                  <button disabled={isRequestLoading} onClick={onClickDelete(todo.id)} className="disabled:opacity-30 disabled:hover:bg-white/10 mr-4 rounded-full bg-white/10 px-6 font-semibold text-white no-underline transition hover:bg-white/20 h-10">Delete</button>
                  <button disabled={isRequestLoading} onClick={onClickToggleDone(todo.id)} className="disabled:opacity-30 disabled:hover:bg-white/10 rounded-full bg-white/10 px-6 font-semibold text-white no-underline transition hover:bg-white/20 h-10">{todo.completed ? 'Undo' : 'Done'}</button>
                </span>
              </li>)}
            </ul>
          }
        </div> : null}
      </main>
    </>
  );
};

// Exports
// ========================================================
export default Todos;