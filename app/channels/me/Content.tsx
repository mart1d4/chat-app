'use client';

import { AddFriend, UserLists } from '@/app/app-components';
import useContextHook from '@/hooks/useContextHook';
import { ReactElement } from 'react';

const Content = (): ReactElement => {
    const { userSettings }: any = useContextHook({ context: 'settings' });
    const tab = userSettings?.friendTab || 'add';

    if (tab === 'add') {
        return <AddFriend />;
    } else {
        return <UserLists content={tab} />;
    }
};

export default Content;
