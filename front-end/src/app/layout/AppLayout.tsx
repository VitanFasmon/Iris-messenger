import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <nav>
          <ul>
            <li>
              <a href="/app" className="block py-2">
                Chats
              </a>
            </li>
            <li>
              <a href="/app/friends" className="block py-2">
                Friends
              </a>
            </li>
            <li>
              <a href="/app/settings" className="block py-2">
                Settings
              </a>
            </li>
            <li>
              <a href="/app/profile" className="block py-2">
                Profile
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
