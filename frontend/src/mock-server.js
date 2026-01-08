// frontend/src/mock-server.js

// Import default icons
import logo from '@/components/icons/logo.svg';

const defaultIcons = [
    logo,
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjQyNjgxMDJ8&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjQyNjgxMDJ8&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjQyNjgxMDJ8&ixlib=rb-4.1.0&q=85',
];

const unlockedIcons = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjQyNjgxMDJ8&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjQyNjgxMDJ8&ixlib=rb-4.1.0&q=85',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NjQyNjgxMDJ8&ixlib=rb-4.1.0&q=85'
];

const SECRET_NAME = 'admin';

export function getAvailableIcons(name) {
    if (name === SECRET_NAME) {
        return [...defaultIcons, ...unlockedIcons];
    }
    return defaultIcons;
}
