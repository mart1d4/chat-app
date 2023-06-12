'use client';

import { AddFriend, UserList } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import { ReactElement } from 'react';

const Content = (): ReactElement => {
    const { userSettings }: any = useContextHook({ context: 'settings' });

    if (userSettings?.friendTab === 'add') {
        return <AddFriend />;
    } else {
        // @ts-ignore
        return <UserList content={userSettings?.friendTab} />;
    }
};

export default Content;
