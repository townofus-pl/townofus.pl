import {headers} from 'next/headers';
import {authenticateHostHeaders} from '@/app/api/_middlewares/hostAuth';
import {requireHost,requireHostMutation} from './requireHost';
jest.mock('server-only',()=>({}),{virtual:true});
jest.mock('next/headers',()=>({headers:jest.fn()}));
jest.mock('@/app/api/_middlewares/hostAuth',()=>({authenticateHostHeaders:jest.fn()}));
beforeEach(()=>{jest.mocked(headers).mockResolvedValue(new Headers({host:'townofus.pl',origin:'https://townofus.pl','x-forwarded-proto':'https'}));jest.mocked(authenticateHostHeaders).mockResolvedValue({success:false});});
test('independently called server actions reject unprivileged accounts',async()=>{await expect(requireHost()).rejects.toThrow('Brak uprawnień hosta');await expect(requireHostMutation()).rejects.toThrow('Brak uprawnień hosta');});
test('mutation action verifies exact Origin including protocol before touching data',async()=>{jest.mocked(authenticateHostHeaders).mockResolvedValue({success:true,user:{username:'Host Discord',accountId:7}});await expect(requireHostMutation()).resolves.toEqual({username:'Host Discord',accountId:7});for(const origin of ['https://evil.example','http://townofus.pl']){jest.mocked(headers).mockResolvedValue(new Headers({host:'townofus.pl',origin,'x-forwarded-proto':'https'}));await expect(requireHostMutation()).rejects.toThrow('Niedozwolone źródło');}});
