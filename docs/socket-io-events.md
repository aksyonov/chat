Socket.IO events
================

From client
-----------

`start` Client send this event once it ready to start.

`chat(message)` Send message to all users in current room.

`room:change(name)` Change current room.

`room:create(name, cb)` Create new room.

From server
-----------

`chat({user, text, date})` Send message to all users in current room.

`room:current(name)` Send current room name on start.

`room:online({name, value})` Online counter.

`rooms:list([{name, online}])` Send list of all rooms on start.

`rooms:new({name, online})` When new room has been created.

`rooms:remove(name)` When room has been deleted (online=0).