import Avatar from '@/app/app-components/Avatar/Avatar';

const HomePage = () => {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
            }}
        >
            <Avatar
                src={'https://ucarecdn.com/47e3b152-66e4-457f-a3ad-f9728f02fade/'}
                size={120}
                alt={'Avatar'}
                status='Offline'
                tooltip={true}
            />
        </div>
    );
};

export default HomePage;
