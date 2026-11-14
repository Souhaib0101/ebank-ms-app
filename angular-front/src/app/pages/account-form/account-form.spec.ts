import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API } from '../../services/api';
import { AccountForm } from './account-form';

describe('Account creation with Signal Forms', () => {
  let fixture: ComponentFixture<AccountForm>;
  let requests: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(AccountForm);
    requests = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
    requests
      .expectOne(API.customers)
      .flush([{ id: 1, name: 'Client', email: 'client@example.com' }]);
    await fixture.whenStable();
  });
  afterEach(() => requests.verify());

  async function fill(selector: string, value: string, event: string) {
    const input: HTMLInputElement | HTMLSelectElement =
      fixture.nativeElement.querySelector(selector);
    input.value = value;
    if (event === 'change') input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event(event, { bubbles: true }));
    await fixture.whenStable();
  }
  async function submit() {
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
  }

  it('blocks invalid balances and missing account types', async () => {
    await fill('#balance', '500', 'input');
    await submit();
    requests.expectNone(API.accounts);
    expect(fixture.nativeElement.textContent).toContain('au moins égal à 1 000');
    expect(fixture.nativeElement.textContent).toContain('Choisissez un type');
  });

  it('converts the selected customer ID to a number and submits only creation fields', async () => {
    await fill('#balance', '3400', 'input');
    await fill('#accountType', 'CURRENT-ACCOUNT', 'change');
    await fill('#customerId', '1', 'change');
    await submit();
    const request = requests.expectOne(API.accounts);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ balance: 3400, type: 'CURRENT-ACCOUNT', customerId: 1 });
    request.flush({ id: 'new-account' });
    expect(navigate).toHaveBeenCalledWith(['/accounts']);
  });

  it('keeps form values and allows retry after a failed save', async () => {
    await fill('#accountType', 'SAVING-ACCOUNT', 'change');
    await fill('#customerId', '1', 'change');
    await submit();
    requests.expectOne(API.accounts).flush('Failed', { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('503');
    expect(fixture.nativeElement.querySelector('#customerId').value).toBe('1');
    await submit();
    requests.expectOne(API.accounts).flush({ id: 'retry-account' });
    expect(navigate).toHaveBeenCalledWith(['/accounts']);
  });
});
