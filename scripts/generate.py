import datetime
from activities.models import Activity, ActivityOffer
from tours.models import Tour, TourOffer
from packages.models import Package, PackageOffer
from users.models import Supplier
from categories.models import Category
from location.models import Location


def create_test_data():
    # Fetch or create necessary foreign key instances
    supplier = Supplier.objects.first()  # Assuming you have at least one supplier
    location = Location.objects.first()  # Assuming you have at least one location
    category = Category.objects.first()  # Assuming you have at least one category

    # Create Activities
    for i in range(3):
        activity = Activity.objects.create(
            featured=False,
            supplier=supplier,
            title=f"Test Activity {i+1}",
            image="path/to/image.jpg",
            description="A test activity description.",
            price=100.00,
            available_from=datetime.date.today(),
            available_to=datetime.date.today() + datetime.timedelta(days=10),
            map="<iframe>Google Map</iframe>",
            stock=10,
            period=60,
            days_off="",
            unit="hours",
            start_time=datetime.time(9, 0),
            end_time=datetime.time(17, 0),
            location=location,
        )
        activity.categories.add(category)

        # Create an offer for the activity
        offer = ActivityOffer.objects.create(
            activity=activity,
            title=f"Offer for Activity {i+1}",
            price=100.00,
            stock=10,
        )

        # Run create_periods method
        activity.create_periods()

    # Create Tours
    for i in range(3):
        tour = Tour.objects.create(
            featured=False,
            supplier=supplier,
            title=f"Test Tour {i+1}",
            image="path/to/image.jpg",
            description="A test tour description.",
            price=200.00,
            available_from=datetime.date.today(),
            available_to=datetime.date.today() + datetime.timedelta(days=10),
            stock=10,
            period=8,  # in hours
            days_off="",
            unit="hours",
            pickup_location="Pickup location",
            pickup_time=datetime.time(8, 0),
            dropoff_time=datetime.time(16, 0),
            location=location,
        )
        tour.categories.add(category)

        # Create an offer for the tour
        offer = TourOffer.objects.create(
            tour=tour,
            title=f"Offer for Tour {i+1}",
            price=200.00,
            stock=10,
        )

        # Run create_tour_days method
        tour.create_tour_days()

    # Create Packages
    for i in range(3):
        package = Package.objects.create(
            featured=False,
            supplier=supplier,
            title=f"Test Package {i+1}",
            image="path/to/image.jpg",
            description="A test package description.",
            duration="3 days",
            available_from=datetime.date.today(),
            available_to=datetime.date.today() + datetime.timedelta(days=10),
            stock=10,
            period=3,  # in days
            days_off="",
            unit="days",
            pickup_location="Pickup location",
            pickup_time=datetime.time(8, 0),
            dropoff_time=datetime.time(16, 0),
            location=location,
        )
        package.categories.add(category)

        # Create an offer for the package
        offer = PackageOffer.objects.create(
            package=package,
            title=f"Offer for Package {i+1}",
            price=300.00,
            stock=10,
        )

        # Run create_package_days method
        package.create_package_days()
