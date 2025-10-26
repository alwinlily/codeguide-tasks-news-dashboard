flowchart TD
    Start[User Opens App] --> AuthCheck{Signed In?}
    AuthCheck -- Yes --> RoleCheck{Is Admin?}
    AuthCheck -- No --> PublicDashboard[Display Public Dashboard]
    RoleCheck -- Yes --> AdminPanel[Display Admin Panel]
    RoleCheck -- No --> PublicDashboard
    PublicDashboard --> FetchTodos[Fetch Todo Items]
    PublicDashboard --> FetchNews[Fetch Company News]
    PublicDashboard --> FetchUrgent[Fetch Urgent Tasks]
    PublicDashboard --> FetchWeather[Fetch Weather Data]
    AdminPanel --> AdminTodos[Todo Management]
    AdminPanel --> AdminNews[News Management]
    AdminTodos --> CreateTodo[Create Todo Task]
    AdminTodos --> EditTodo[Edit Todo Task]
    AdminTodos --> DeleteTodo[Delete Todo Task]
    AdminNews --> CreateNews[Create News Item]
    AdminNews --> EditNews[Edit News Item]
    AdminNews --> DeleteNews[Delete News Item]