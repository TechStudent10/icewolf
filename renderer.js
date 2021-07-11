let tabs = [
    {
        index: 0,
        url: 'https://google.com',
        title: 'Google'
    },
    {
        index: 1,
        url: 'https://github.com',
        title: 'GitHub'
    }
]
const tabs_dom = document.querySelector('.tabs')
const webview = document.getElementById('webview')

let current_index = 0

const createNewTab = (index, url, title) => {
    const _tab = document.createElement('div')
    _tab.role = 'button'
    _tab.id = `tab-${index}`
    _tab.classList = ['tab']
    _tab.innerHTML = title
    _tab.addEventListener('click', (event) => {
        // tabs[current_index].url = webview.getURL()
        current_index = index
        webview.loadURL(tabs[current_index].url)
        console.log(`In createNewTab function`)
        console.log(`tabs[current_index].url = ${tabs[current_index].url}`)
        console.log(`current_index = ${current_index}`)
    })
    tabs_dom.appendChild(_tab)
}

tabs.map((tab) => {
    createNewTab(tab.index, tab.url, tab.title)
})

const tab = document.createElement('div')
tab.role = 'button'
tab.classList = ['tab']
tab.innerHTML = 'Create New Tab'
tab.addEventListener('click', (event) => {
    tabs[current_index].url = webview.src
    tabs = [...tabs, {
        index: tabs.length,
        url: 'file:///local-ntp.html',
        title: 'New Tab'
    }]
    webview.loadURL('file:///local-ntp.html')
    current_index = tabs.length - 1
    createNewTab(current_index, 'file:///local-ntp.html', 'New Tab')
    tabs_dom.removeChild(tab)
    tabs_dom.appendChild(tab)
})
tabs_dom.appendChild(tab)

webview.addEventListener('did-stop-loading', (event) => {
    let title = webview.getTitle()
    let url = webview.getURL()
    tabs[current_index].title = title
    tabs[current_index].url = url
    document.getElementById(`tab-${current_index}`).innerHTML = title
})