<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Pathology;
use App\Models\DocumentTemplate;
use App\Models\User;
use App\Models\File;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClientControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear usuario autenticado
        $this->user = User::factory()->create();
        $this->actingAs($this->user);
    }

    /** @test */
    public function it_can_display_clients_index()
    {
        // Crear algunos clientes de prueba
        Client::factory()->count(3)->create();

        $response = $this->get(route('clients.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Index')
            ->has('clients.data', 3)
            ->has('stats')
            ->has('documentTemplates')
        );
    }

    /** @test */
    public function it_can_filter_clients_by_search()
    {
        $client1 = Client::factory()->create(['name' => 'Juan Pérez']);
        $client2 = Client::factory()->create(['name' => 'María García']);
        $client3 = Client::factory()->create(['name' => 'Carlos López']);

        $response = $this->get(route('clients.index', ['search' => 'Juan']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Index')
            ->has('clients.data', 1)
            ->where('clients.data.0.name', 'Juan Pérez')
        );
    }

    /** @test */
    public function it_can_filter_clients_by_status()
    {
        Client::factory()->create(['status' => 'active']);
        Client::factory()->create(['status' => 'inactive']);

        $response = $this->get(route('clients.index', ['status' => 'active']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Index')
            ->has('clients.data', 1)
            ->where('clients.data.0.status', 'active')
        );
    }

    /** @test */
    public function it_can_display_create_client_form()
    {
        $pathology = Pathology::factory()->create();

        $response = $this->get(route('clients.create'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Create')
            ->has('pathologies', 1)
        );
    }

    /** @test */
    public function it_can_store_a_new_client()
    {
        $pathology = Pathology::factory()->create();

        $clientData = [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone_prefix' => '0412',
            'phone_number' => '1234567',
            'identification_prefix' => 'V',
            'identification_number' => '12345678',
            'address' => 'Calle Principal #123',
            'birth_date' => '1990-01-01',
            'gender' => 'male',
            'status' => 'active',
            'notes' => 'Cliente de prueba',
            'pathologies' => [
                [
                    'id' => $pathology->id,
                    'notes' => 'Notas de patología'
                ]
            ]
        ];

        $response = $this->post(route('clients.store'), $clientData);

        $response->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone' => '04121234567',
            'identification_number' => 'V-12345678',
            'status' => 'active'
        ]);

        $client = Client::where('name', 'Juan Pérez')->first();
        $this->assertTrue($client->pathologies->contains($pathology));
    }

    /** @test */
    public function it_can_store_client_from_membership_modal()
    {
        $clientData = [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone_prefix' => '0412',
            'phone_number' => '1234567',
            'identification_prefix' => 'V',
            'identification_number' => '12345678',
            'status' => 'active',
            'fromMembership' => true
        ];

        $response = $this->post(route('clients.store'), $clientData);

        $response->assertRedirect();
        $response->assertSessionHas('flash_client');
        $response->assertSessionHas('flash_success', true);
    }

    /** @test */
    public function it_validates_required_fields_when_storing_client()
    {
        $response = $this->post(route('clients.store'), []);

        $response->assertSessionHasErrors([
            'name',
            'identification_number'
        ]);
    }

    /** @test */
    public function it_validates_unique_email_when_storing_client()
    {
        Client::factory()->create(['email' => 'juan@example.com']);

        $response = $this->post(route('clients.store'), [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone_prefix' => '0412',
            'phone_number' => '1234567',
            'identification_prefix' => 'V',
            'identification_number' => '12345678',
            'status' => 'active'
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function it_validates_unique_identification_number_when_storing_client()
    {
        Client::factory()->create(['identification_number' => 'V-12345678']);

        $response = $this->post(route('clients.store'), [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone_prefix' => '0412',
            'phone_number' => '1234567',
            'identification_prefix' => 'V',
            'identification_number' => '12345678',
            'status' => 'active'
        ]);

        $response->assertSessionHasErrors(['identification_number']);
    }

    /** @test */
    public function it_can_display_client_show_page()
    {
        $client = Client::factory()->create();

        $response = $this->get(route('clients.show', $client));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Show')
            ->has('client')
            ->where('client.id', $client->id)
        );
    }

    /** @test */
    public function it_can_display_client_edit_form()
    {
        $client = Client::factory()->create();
        $pathology = Pathology::factory()->create();

        $response = $this->get(route('clients.edit', $client));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Edit')
            ->has('client')
            ->has('pathologies')
            ->where('client.id', $client->id)
        );
    }

    /** @test */
    public function it_can_update_client()
    {
        $client = Client::factory()->create(['name' => 'Juan Pérez']);
        $pathology = Pathology::factory()->create();

        $updateData = [
            'name' => 'Juan Carlos Pérez',
            'email' => 'juancarlos@example.com',
            'phone_prefix' => '0414',
            'phone_number' => '7654321',
            'identification_prefix' => 'V',
            'identification_number' => '87654321',
            'address' => 'Nueva dirección',
            'birth_date' => '1985-05-15',
            'gender' => 'male',
            'status' => 'active',
            'notes' => 'Cliente actualizado',
            'pathologies' => [
                [
                    'id' => $pathology->id,
                    'notes' => 'Nuevas notas de patología'
                ]
            ]
        ];

        $response = $this->put(route('clients.update', $client), $updateData);

        $response->assertRedirect(route('clients.index'));

        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'name' => 'Juan Carlos Pérez',
            'email' => 'juancarlos@example.com',
            'phone' => '04147654321',
            'identification_number' => 'V-87654321'
        ]);

        $client->refresh();
        $this->assertTrue($client->pathologies->contains($pathology));
    }

    /** @test */
    public function it_validates_unique_email_when_updating_client()
    {
        $client1 = Client::factory()->create(['email' => 'juan@example.com']);
        $client2 = Client::factory()->create(['email' => 'maria@example.com']);

        $response = $this->put(route('clients.update', $client2), [
            'name' => $client2->name,
            'email' => 'juan@example.com',
            'status' => 'active'
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function it_can_delete_client()
    {
        $client = Client::factory()->create();

        $response = $this->delete(route('clients.destroy', $client));

        $response->assertRedirect(route('clients.index'));
        $this->assertSoftDeleted($client);
    }

    /** @test */
    public function it_can_restore_soft_deleted_client()
    {
        $client = Client::factory()->create();
        $client->delete();

        $response = $this->post(route('clients.restore', $client->id));

        $response->assertRedirect(route('clients.index'));
        $this->assertDatabaseHas('clients', ['id' => $client->id, 'deleted_at' => null]);
    }

    /** @test */
    public function it_can_force_delete_client()
    {
        $client = Client::factory()->create();
        $client->delete();

        $response = $this->delete(route('clients.force-delete', $client->id));

        $response->assertRedirect(route('clients.index'));
        $this->assertDatabaseMissing('clients', ['id' => $client->id]);
    }

    /** @test */
    public function it_can_search_clients()
    {
        $client1 = Client::factory()->create(['name' => 'Juan Pérez']);
        $client2 = Client::factory()->create(['name' => 'María García']);
        $client3 = Client::factory()->create(['email' => 'juan@example.com']);

        $response = $this->get('/clients/search?query=Juan');

        $response->assertStatus(200);
        $response->assertJsonCount(2);
        $response->assertJsonFragment(['name' => 'Juan Pérez']);
        $response->assertJsonFragment(['email' => 'juan@example.com']);
    }

    /** @test */
    public function it_can_remove_profile_photo()
    {
        $client = Client::factory()->create();
        $photo = File::factory()->create([
            'fileable_id' => $client->id,
            'fileable_type' => Client::class,
            'type' => 'profile_photo'
        ]);

        $response = $this->delete(route('clients.remove-profile-photo', $client));

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Foto de perfil eliminada exitosamente.']);
        $this->assertDatabaseMissing('files', ['id' => $photo->id]);
    }

    /** @test */
    public function it_returns_404_when_removing_nonexistent_profile_photo()
    {
        $client = Client::factory()->create();

        $response = $this->delete(route('clients.remove-profile-photo', $client));

        $response->assertStatus(404);
        $response->assertJson(['message' => 'No se encontró foto de perfil.']);
    }

    /** @test */
    public function it_can_filter_clients_by_membership_status()
    {
        // Crear clientes con diferentes estados de membresía
        $clientWithActiveMembership = Client::factory()->create();
        $clientWithExpiredMembership = Client::factory()->create();
        $clientWithoutMembership = Client::factory()->create();

        $response = $this->get(route('clients.index', ['membership_status' => 'active']));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Index')
            ->where('filters.membership_status', 'active')
        );
    }

    /** @test */
    public function it_can_sort_clients()
    {
        Client::factory()->create(['name' => 'Carlos']);
        Client::factory()->create(['name' => 'Ana']);
        Client::factory()->create(['name' => 'Bob']);

        $response = $this->get(route('clients.index', [
            'sort_by' => 'name',
            'sort_direction' => 'asc'
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Clients/Index')
            ->where('filters.sort_by', 'name')
            ->where('filters.sort_direction', 'asc')
        );
    }

    /** @test */
    public function it_validates_birth_date_is_before_today()
    {
        $response = $this->post(route('clients.store'), [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone_prefix' => '0412',
            'phone_number' => '1234567',
            'identification_prefix' => 'V',
            'identification_number' => '12345678',
            'status' => 'active',
            'birth_date' => now()->addDay()->format('Y-m-d') // Fecha futura
        ]);

        $response->assertSessionHasErrors(['birth_date']);
    }

    /** @test */
    public function it_validates_gender_values()
    {
        $response = $this->post(route('clients.store'), [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone_prefix' => '0412',
            'phone_number' => '1234567',
            'identification_prefix' => 'V',
            'identification_number' => '12345678',
            'status' => 'active',
            'gender' => 'invalid_gender'
        ]);

        $response->assertSessionHasErrors(['gender']);
    }

    /** @test */
    public function it_validates_identification_prefix_values()
    {
        $response = $this->post(route('clients.store'), [
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'phone_prefix' => '0412',
            'phone_number' => '1234567',
            'identification_prefix' => 'X', // Prefijo inválido
            'identification_number' => '12345678',
            'status' => 'active'
        ]);

        $response->assertSessionHasErrors(['identification_prefix']);
    }
}
