'use client';

import useContextHook from '@/hooks/useContextHook';
import { AddFriend, UserLists } from '@components';
import { ReactElement } from 'react';

const Content = ({ data }: any): ReactElement => {
    const { userSettings }: any = useContextHook({ context: 'settings' });
    const tab = userSettings?.friendTab || 'add';

    if (tab === 'add') {
        return <AddFriend />;
    } else {
        return (
            <UserLists
                content={tab}
                data={data}
            />
        );
    }
};

export default Content;
