<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;

class LanguageController extends Controller
{
    /**
     * Change the application language.
     */
    public function changeLanguage(Request $request, $locale)
    {
        // Validate that the locale is supported
        $supportedLocales = ['en', 'es'];

        if (!in_array($locale, $supportedLocales)) {
            abort(404);
        }

        // Set the locale in the session
        Session::put('locale', $locale);

        // Set the locale for the current request
        App::setLocale($locale);

        // Redirect back to the previous page
        return redirect()->back();
    }
}
