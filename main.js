
var port = null;

connect();
function SendNativeMessage(message) 
{	
	port.postMessage({"text": message});
}

function onNativeMessage(message) 
{	
	var command = message["message"];		
	if(!command)
	{
		//There's no text
		SendNativeMessage("Empty message received");
		return;
	}
	
	var commandParams = command.split(" ");
	var firstCommand = commandParams[0];
	
	if (firstCommand == "focuswindow")
	{
		if (commandParams.length < 2)
		{
			SendNativeMessage("Can't focus window without an ID");
			return; 
		}
		
		var parameter = commandParams[1];		
		var windowId = parseInt(parameter, 10);
		
		if (!windowId)
		{
			SendNativeMessage("Window ID is invalid");
			return;
		}
		
		chrome.windows.update(windowId, {focused: true}, function(win) 
		{
			if (win != null)
			{
				var msg = "Window Id: " + windowId + " focused";
				SendNativeMessage(msg);
			}
			else
			{
				SendNativeMessage("Window Id: " + windowId + " does not exist");
			}			
		});
		
		return;
	}
	
	if (firstCommand == "getwindowpos")
	{
		if (commandParams.length < 2)
		{
			SendNativeMessage("Can't get window position without an ID");
			return; 
		}
		
		var parameter = commandParams[1];		
		var windowId = parseInt(parameter, 10);
		
		if (!windowId)
		{
			SendNativeMessage("Window ID is invalid");
			return;
		}
		
		chrome.windows.get(windowId, function win)
		{
			if (win != null)
			{
				SendNativeMessage("{\"Top\": " + win.Top + ", \"Left\": " + win.Left + "}");
			}
			else
			{
				SendNativeMessage("Window Id: " + windowId + " does not exist");
			}	
		});
		
		return;
	}
	
	if (firstCommand == "movewindow")
	{
		if (commandParams.length < 4)
		{
			SendNativeMessage("Can't move window without an ID");
			return; 
		}
		
		var parameter = commandParams[1];		
		var windowId = parseInt(parameter, 10);
		var xPosParam = commandParams[2];
		var yPosParam = commandParams[3];
		var xPos = parseInt(xPosParam);
		var yPos = parseInt(yPosParam);
		
		if (isNaN(windowId))
		{
			SendNativeMessage("Window ID is invalid");
			return;
		}
		
		if (isNaN(xPos))
		{
			SendNativeMessage("Invalid X co-ordinate");
			return;
		}
		
		if (isNaN(yPos))
		{
			SendNativeMessage("Invalid Y co-ordinate");
			return;
		}
		
		chrome.windows.update(windowId, {left: xPos, top: yPos}, function(win) 
		{
			if (win != null)
			{
				var msg = "Window Id: " + windowId + " moved to co-ordinates: " + xPos  + " - " + yPos;
				SendNativeMessage(msg);
			}
			else
			{
				SendNativeMessage("Window Id: " + windowId + " does not exist");
			}			
		});
		
		return;
	}
	
	if (firstCommand == "changestate")
	{
		if (commandParams.length < 3)
		{
			SendNativeMessage("Can't change window state without an ID");
			return; 
		}
		
		var parameter = commandParams[1];		
		var windowId = parseInt(parameter, 10);
		var windowState = commandParams[2];
		
		if (isNaN(windowId))
		{
			SendNativeMessage("Window ID is invalid");
			return;
		}
				
		chrome.windows.update(windowId, {state: windowState}, function(win) 
		{
			if (win != null)
			{
				var msg = "Window Id: " + windowId + " state changed to: " + windowState;
				SendNativeMessage(msg);
			}
			else
			{
				SendNativeMessage("Window Id: " + windowId + " does not exist");
			}			
		});
		
		return;
	}
	
	if (firstCommand == "closewindow")
	{
		if (commandParams.length < 2)
		{
			SendNativeMessage("Can't close window without an ID");
			return; 
		}
		
		var parameter = commandParams[1];		
		var windowId = parseInt(parameter, 10);
		
		if (!windowId)
		{
			SendNativeMessage("Window ID is invalid");
			return;
		}
		
		DoesWindowExist(windowId, function(win)
		{
			if (win != null)
			{
				chrome.windows.remove(windowId, function() { });
				var msg = "Window " + windowId + " removed";
				SendNativeMessage(msg);
			}
			else
			{
				SendNativeMessage("Window Id: " + windowId + " does not exist");
			}
		});
		
		return;
	}
	
	if (firstCommand == "closetab")
	{
		if (commandParams.length < 2)
		{
			SendNativeMessage("Can't close tab without an ID");
			return;
		}
		
		var parameter = commandParams[1];		
		var tabId = parseInt(parameter, 10);
		
		if (!tabId)
		{
			SendNativeMessage("Tab ID is invalid");
			return;
		}
		
		DoesTabExist(tabId, function(tab)
		{
			if (tab != null)
			{
				chrome.tabs.remove(tabId, function() { });
				SendNativeMessage("Tab "+  tabId + " removed");
			}
			else
			{
				SendNativeMessage("Tab Id: " + tabId + " does not exist");
			}
		});
				
		return;
	}
	
	if (firstCommand == "opentab")
	{
		if (commandParams.length < 3)
		{
			SendNativeMessage("Can't create tab without a URL");
			return;
		}
		
		var windowParam = commandParams[1];	
		
		if (!windowParam)
		{
			SendNativeMessage("Window Id is invalid");
			return;
		}
		
		var windowId = parseInt(windowParam, 10);
		
		var parameter = commandParams[2];		
		
		if (!parameter)
		{
			SendNativeMessage("URL is invalid");
			return;
		}
		
		DoesWindowExist(windowId, function(cWindow)
		{
			if (cWindow != null)
			{
				chrome.tabs.create({url: parameter, windowId: windowId}, function(chromeTab)
				{ 
					SendNativeMessage(chromeTab.id);
				});
			}
			else
			{
				SendNativeMessage("Window Id: " + windowId + " does not exist");
			}
		});
				
		return;
	}
	
	if (firstCommand == "openwindow")
	{
		if (commandParams.length < 2)
		{
			SendNativeMessage("Can't create a window without a URL");
			return;
		}
		
		var parameter = commandParams[1];		
		
		if (!parameter)
		{
			SendNativeMessage("URL is invalid");
			return;
		}
		
		chrome.windows.create({url: parameter, state: "maximized"}, function(chromeWindow)
		{ 
			SendNativeMessage("{\"windowId\": " + chromeWindow.id + ", \"tabId\": " + chromeWindow.tabs[0].id + "}");
		});
		return;
	}
	
	if (firstCommand == "changetaburl")
	{
		if (commandParams.length < 3)
		{
			SendNativeMessage("Can't change a tab url without an ID and a URL");
			return;
		}
		
		var tabId = parseInt(commandParams[1], 10);		
		var url = commandParams[2];
		
		if (!tabId || !url)
		{
			SendNativeMessage("URL or ID is invalid");
			return;
		}
		
		DoesTabExist(tabId, function(tab)
		{
			if (tab != null)
			{
				chrome.tabs.update(tabId, {url: url}, function(chromeWindow){ });
				SendNativeMessage("Tab URL updated");
			}
			else
			{
				SendNativeMessage("Tab Id: " + tabId + " does not exist");
			}
		});
			
		return;
	}
	
	if (firstCommand == "getwindows")
	{
		chrome.windows.getAll({populate: false}, function(windows) 
		{ 
			var i;
			var listWindows = [];
			for (i = 0; i < windows.length; i++) 
			{ 
				var id = windows[i].id;
				listWindows.push(id);		
			}
			SendNativeMessage(listWindows.toString());
		});
		
		return;
	}
	
	if (firstCommand == "gettabs")
	{
		chrome.tabs.query({ }, function(tabs) 
		{ 
			var i;
			var listTabs = [];
			for (i = 0; i < tabs.length; i++) 
			{ 
				listTabs.push(tabs[i].id);						
			}
			
			SendNativeMessage(listTabs.toString());
		});
		
		return;
	}
	
	if (firstCommand == "geturl")
	{
		if (commandParams.length < 2)
		{
			SendNativeMessage("Can't get url without a Tab ID");
			return;
		}
		
		var tabId = parseInt(commandParams[1], 10);	
		
		DoesTabExist(tabId, function(tab)
		{
			if (tab != null)
			{
				SendNativeMessage(tab.url);
			}
			else
			{
				SendNativeMessage("Tab Id: " + tabId + " does not exist");
			}			
		});
		
		return;
	}
	
	if (firstCommand == "gettabsinwindow")
	{
		if (commandParams.length < 2)
		{
			SendNativeMessage("Can't get tabs without a Window Id");
			return;
		}
		
		var parameter = commandParams[1];		
		
		if (!parameter)
		{
			SendNativeMessage("Window Id is invalid");
			return;
		}
		
		var windowId = parseInt(parameter, 10);
		
		DoesWindowExist(windowId, function(cWindow)
		{
			if (cWindow != null)
			{
				chrome.tabs.getAllInWindow(windowId, function(tabs) 
				{ 
					var i;
					var listTabs = [];
					for (i = 0; i < tabs.length; i++) 
					{ 
						listTabs.push(tabs[i].id);						
					}
					
					SendNativeMessage(listTabs.toString());
				});
			}
			else
			{
				SendNativeMessage("Window Id: " + windowId + " does not exist");
			}
		});
				
		return;
	}	
}

function DoesTabExist(tabId, callback)
{
	chrome.tabs.query({ }, function(tabs) 
	{ 
		var i;
		var listTabs = [];
		for (i = 0; i < tabs.length; i++) 
		{ 
			if (tabs[i].id == tabId)
			{
				callback(tabs[i]);
				return;
			}
		}
		
		callback(null);
	});
}

function DoesWindowExist(windowId, callback)
{
	chrome.windows.getAll({populate: false}, function(windows) 
	{ 
		var i;
		for (i = 0; i < windows.length; i++) 
		{ 
			if (windows[i].id == windowId)
			{
				callback(windows[i]);
				return;
			}
		}
		
		callback(null);		
	});
}

function CloseAllTabs()
{
	
}

function onDisconnected() {
  port = null;
}

function connect() {
  var hostName = "com.datadyne.chromeserver.message";
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
}
