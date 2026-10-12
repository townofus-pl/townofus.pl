import {NextRequest} from 'next/server';
import {authenticateHostHeaders} from '@/app/api/_middlewares/hostAuth';
import {GET} from './route';
jest.mock('@/app/api/_middlewares/hostAuth',()=>({authenticateHostHeaders:jest.fn()}));
test('navigation permission discovery never challenges anonymous visitors',async()=>{jest.mocked(authenticateHostHeaders).mockResolvedValue({success:false});const response=await GET(new NextRequest('https://townofus.pl/dramaafera/host/access'));expect(response.status).toBe(200);expect(await response.json()).toEqual({isHost:false});expect(response.headers.get('www-authenticate')).toBeNull();expect(response.headers.get('cache-control')).toBe('no-store');});
test('Host link is permitted only after positive server authorization',async()=>{jest.mocked(authenticateHostHeaders).mockResolvedValue({success:true,user:{username:'Host Discord',accountId:7}});const response=await GET(new NextRequest('https://townofus.pl/dramaafera/host/access'));expect(await response.json()).toEqual({isHost:true});});
