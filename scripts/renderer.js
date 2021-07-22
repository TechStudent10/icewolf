const { app, BrowserWindow } = require('@electron/remote')
const storage = require('electron-json-storage')
const path = require('path')
const {
    v4: uuidv4
} = require('uuid')

storage.setDataPath(path.join(__dirname, 'bookmarks'))

const newTabUrl = 'icewolf://local-ntp.html'

let tabs = [
    {
        index: 0,
        url: newTabUrl,
        title: 'New Tab'
    }
]

const win = BrowserWindow.getFocusedWindow()

const tabs_dom = document.querySelector('.tabs')
const webviews = document.getElementById('webviews')
const webviewBase = document.getElementById('webview-base')
const address = document.getElementById('address')
const tabSpace = document.querySelector('.tabs .space')
const loadingBar = document.querySelector('.loading-bar')
const backButton = document.getElementById('back-button')
const forwardButton = document.getElementById('forward-button')
const refreshButton = document.getElementById('refresh-button')
const closeButton = document.getElementById('close-button')
const minimizeButton = document.getElementById('minimize-button')
const maximizeRestoreButton = document.getElementById('maximize-restore-button')
const optionsDropdown = document.querySelector('.options-dropdown')
const optionsButton = document.querySelector('.options-button')
const navbar = document.querySelector('.navbar')
const bookmarkSpace = document.querySelector('.bookmarks .space')
const bookmarks = document.querySelector('.bookmarks')
const bookmarkButton = document.getElementById('bookmark-button')

let current_index = 0

const getTab = (index) => {
    return tabs[index]
}

const getCurrentTab = () => {
    return getTab(current_index)
}

const createNewTab = (index, url, title) => {
    const tab = document.createElement('div')
    const webview = webviewBase.cloneNode(true)

    // Setup tab button
    tab.role = 'button'
    tab.id = `tab-${index}`
    tab.classList.add('tab')
    tab.classList.add('actual')
    tab.innerHTML = `${title}`
    tab.style.display = 'flex'

    // Setup webview
    console.log(webview)
    webview.src = url
    // webview.style.display = 'none'
    webview.id = `webview-${index}`
    webview.classList = ['view']

    tab.addEventListener('click', (event) => {
        document.getElementById(`webview-${current_index}`).style.display = 'none'
        if (current_index != index) document.getElementById(`tab-${current_index}`).classList.remove('active')
        document.getElementById(`tab-${index}`).classList.add('active')
        current_index = index
        let currentTab = getCurrentTab()
        webview.style.display = 'flex'
        address.value = currentTab.url
    })
    webview.addEventListener('new-window', (e) => {
        const url = e.url
        createNewTab(tabs.length, url, 'New Tab')
    })
    webview.addEventListener('did-start-loading', (event) => {
        loadingBar.classList.add('animate')
    })
    webview.addEventListener('did-stop-loading', (event) => {
        let title = webview.getTitle()
        let url = webview.getURL()
        tabs[index].title = title
        tabs[index].url = url
        document.getElementById(`tab-${index}`).innerHTML = title
        if (current_index == index) {
            address.value = url
        }
        console.log(url.substring(0, 15))
        if (url.substring(0, 15) == 'file:///icewolf') {
            address.value = `icewolf://${address.value.substring(16)}`
        }
        if (url == newTabUrl) {
            address.value = ''
        }
        loadingBar.classList.remove('animate')
    })
    webview.addEventListener('enter-html-full-screen', (e) => {
        navbar.style.display = 'none'
        webview.classList.add('fullscreen')
        webviews.classList.add('fullscreen')
    })
    webview.addEventListener('leave-html-full-screen', (e) => {
        navbar.style.display = 'block'
        webview.classList.remove('fullscreen')
        webviews.classList.remove('fullscreen')
    })

    webviews.appendChild(webview)
    tabs_dom.appendChild(tab)
    const space = tabSpace.cloneNode(true)
    space.classList.add('tab-space')
    tabs_dom.appendChild(space)
    tab.click()
    return tab
}

function isURL(str) {
    let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i') // fragment locator
    return !!pattern.test(str)
}

const close_tab = (index) => {
    const tab = tabs[index]
    if (!tab) return;
    tabs.remove(tab)
    document.getElementById(`tab-${index}`).remove()
    document.getElementById(`webview-${index}`).remove()
}

const createBookmark = (title, url) => {
    const bookmark_element = document.createElement('div')
    bookmark_element.classList.add('bookmark')
    bookmark_element.innerHTML = title
    bookmark_element.addEventListener('click', (e) => {
        document.getElementById(`webview-${current_index}`).loadURL(url)
    })
    
    if (bookmarks.innerHTML == '<div style="padding-left:10px;">No Bookmarks Found!</div>') bookmarks.innerHTML = ''
    bookmarks.appendChild(bookmark_element)
    bookmarks.appendChild(bookmarkSpace.cloneNode(true))
}

tabs.map((tab) => {
    createNewTab(tab.index, tab.url, tab.title)
})

const tab = document.createElement('div')
tab.role = 'button'
tab.classList = ['tab']
tab.innerHTML = '<i class="fas fa-plus"></i>'
tab.addEventListener('click', (event) => {
    tabs = [...tabs, {
        index: tabs.length,
        url: newTabUrl,
        title: 'New Tab'
    }]
    current_index = tabs.length - 1
    createNewTab(current_index, newTabUrl, 'New Tab')
    document.getElementById(`webview-${current_index}`).style.display = 'block'
    tabs_dom.removeChild(tab)
    tabs_dom.appendChild(tab)
})
tabs_dom.appendChild(tab)

// Add click events to nav-buttons
backButton.addEventListener('click', (event) => {
    const webview = document.getElementById(`webview-${current_index}`)
    if (webview.canGoBack()) {
        webview.goBack()
    }
})

forwardButton.addEventListener('click', (event) => {
    const webview = document.getElementById(`webview-${current_index}`)
    if (webview.canGoForward()) {
        webview.goForward()
    }
})

refreshButton.addEventListener('click', (event) => {
    document.getElementById(`webview-${current_index}`).reload()
})

// Add keydown event to input
address.addEventListener('keydown', (event) => {
    if (event.keyCode == 13) {
        let value = address.value
        let url
        if (value.startsWith('icewolf://')) {
            value = value.substring(10)
            url = `file:///icewolf/${value}`
        }
        else if (isURL(value)) {
            if (!value.startsWith('http')) {
                url = `http://${value}`
            } else {
                url = value
            }
        } else {
            url = `https://www.google.com/search?q=${value}`
        }

        document.getElementById(`webview-${current_index}`).loadURL(url)
    }
})

const _tabs_got = document.getElementsByClassName('tab')
for (var i = _tabs_got.length - 1; i >= 0; i--) {
    if (tab.id) {
        const tab = _tabs_got[i]
        tab.innerHTML += '<i class="fas fa-times"></i>'
    }
}

// Add event listeners to window controls
closeButton.addEventListener('click', (event) => {
    win.close()
})

minimizeButton.addEventListener('click', (event) => {
    win.minimize()
})

maximizeRestoreButton.addEventListener('click', (event) => {
    if (win.isMaximized()) {
        win.restore()
    } else {
        win.maximize()
    }

    console.log('hi')
})

// Events for when window is maximized and restored
win.on('maximize', (e) => {
    maximizeRestoreButton.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>'
})

win.on('unmaximize', (e) => {
    maximizeRestoreButton.innerHTML = '<i class="far fa-square"></i>'
})

// Check if window is maximized or not
if (win.isMaximized()) {
    maximizeRestoreButton.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>'
} else {
    maximizeRestoreButton.innerHTML = '<i class="far fa-square"></i>'
}

// Show options dropdown if not already open
optionsButton.addEventListener('click', (event) => {
    if (optionsDropdown.style.display == 'block') {
        optionsDropdown.style.display = 'none'
    } else {
        optionsDropdown.style.display = 'block'
    }
})

// Add keyboard shortcuts
let reload_shortcut
if (app.isPackaged) {
    reload_shortcut = 'control+r'
} else {
    reload_shortcut = 'control+alt+r'
}
shortcut.add(reload_shortcut, () => {
    document.getElementById(`webview-${current_index}`).reload()
})

shortcut.add('control+w', () => {
    close_tab(current_index)
})

let inspect_shortcut
if (app.isPackaged) {
    inspect_shortcut = 'control+shift+i'
} else {
    inspect_shortcut = 'control+shift+j'
}

shortcut.add(inspect_shortcut, () => {
    const webview = document.getElementById(`webview-${current_index}`)
    if (webview.isDevToolsOpened()) {
        webview.closeDevTools()
    } else {
        webview.openDevTools()
    }
})

// Add events for when app is selected and not
app.on('browser-window-focus', () => {
    const current_tab = document.getElementById(`tab-${current_index}`)
    if (current_tab.classList.contains('window-inactive')) {
        current_tab.classList.remove('window-inactive')
    }
})
app.on('browser-window-blur', () => {
    const current_tab = document.getElementById(`tab-${current_index}`)
    if (!current_tab.classList.contains('window-inactive')) {
        current_tab.classList.add('window-inactive')
    }
})

// Adding bookmarks to the bookmark bar
storage.getAll((error, data) => {
    if (error) throw error

    if (Object.keys(data).length == 0) {
        bookmarks.innerHTML = '<div style="padding-left:10px;">No Bookmarks Found!</div>'
    }
    Object.keys(data).map((key) => {
        const bookmark = data[key]
        createBookmark(bookmark.title, bookmark.url)
    })
})

// Add click event to the bookmark button
bookmarkButton.addEventListener('click', (e) => {
    const webview = document.getElementById(`webview-${current_index}`)
    let url = webview.getURL()
    let title = webview.getTitle()
    let count;
    let bookmarkExists = false

    console.log(
        `
        URL: ${url}\n
        Title: ${title}
    `)

    storage.set(`${uuidv4()}`, {
        url: url,
        title: title
    }, (error) => {
        if (error) throw error

        console.log("PLEASE WORK")
    })

    createBookmark(title, url)
})
